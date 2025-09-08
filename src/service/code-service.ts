// TODO :
// 1. IMPLEMENT REDIS (lIKE GENERATE HASH FOR CODE + LANGUAGE, STORE RESULT IN CACHE WITH EXPIRY, CHECK CACHE BEFORE EXECUTION)
// 2. IMPLEMENT RABBITMQ (LIKE SEND CODE TO QUEUE, WORKER PULLS FROM QUEUE AND EXECUTES, STORES RESULT IN CACHE)
// 3. SANITIZE INPUT (LIKE CHECK FOR MALICIOUS CODE PATTERNS)
// 4. RATE LIMIT
// 5. STORE THE SUBMITTED CODE AND RESULTS IN DB 





import { exec } from "child_process";
import { unlinkSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { promisify } from "util";
import { v4 as uuid } from "uuid";
import path from "path";
import { CANCELLED } from "dns";

const execPromise = promisify(exec);

const tempDir = path.join(process.cwd(), "src", "tempDir");
if (!existsSync(tempDir)) {
  mkdirSync(tempDir, { recursive: true });
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

const escapePath = (filePath: string): string => {
  return `"${filePath.replace(/\\/g, "/")}"`;
};

export const executeCode = async (code: string, language: string): Promise<ExecutionResult> => {
  const startTime = Date.now();
  const fileId = uuid();
  
  try {
    switch (language.toLowerCase()) {
      case 'c':
        return await executeCCode(code, fileId);
      case 'cpp':
      case 'c++':
        return await executeCppCode(code, fileId);
      case 'java':
        return await executeJavaCodeInternal(code, fileId);
      case 'python':
        return await executePythonCode(code, fileId);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime
    };
  }
};


// JUST AN HELPER FUNCTION FOR CODE FORMATTING
const formatCCode = (code: string): string => {
  if (!code.includes('\n') && code.includes('#include')) {
    let formatted = code
      .replace(/#include\s*<[^>]+>/g, match => match + '\n')
      .replace(/#include\s*"[^"]+"/g, match => match + '\n')
      .replace(/\s*(int\s+main\s*\([^)]*\)\s*{)/g, '\n$1\n    ')
      .replace(/;(?![^"]*"[^"]*$)/g, ';\n    ')
      .replace(/\s*(return\s+[^;]+;)/g, '\n    $1')
      .replace(/\s*}/g, '\n}')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    return formatted;
  }
  return code;
};


const executeCCode = async (code: string, fileId: string): Promise<ExecutionResult> => {
  const startTime = Date.now();
  const fileName = `main_${fileId}.c`;
  const filePath = path.join(tempDir, fileName);
  const outputPath = path.join(tempDir, fileId);

  try {
    const formattedCode = formatCCode(code);
    writeFileSync(filePath, formattedCode);

    // Use quotes around the volume path to handle spaces
    const dockerCommand = `docker run --rm -v ${escapePath(tempDir)}:/code gcc:latest sh -c "cd /code && gcc ${fileName} -o ${fileId} && timeout 10s ./${fileId}"`;
    
    const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 15000 });

    if (stderr && stderr.includes('error:')) {
      return {
        success: false,
        output: '',
        error: `Compilation error: ${stderr.trim()}`,
        executionTime: Date.now() - startTime
      };
    }

    return {
      success: true,
      output: stdout.trim(),
      error: stderr && stderr.includes('warning:') ? stderr.trim() : undefined,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime: Date.now() - startTime
    };
  } finally {
    cleanup(filePath, outputPath);
  }
};

const executeCppCode = async (code: string, fileId: string): Promise<ExecutionResult> => {
  const startTime = Date.now();
  const fileName = `main_${fileId}.cpp`;
  const filePath = path.join(tempDir, fileName);
  const outputPath = path.join(tempDir, fileId);

  try {
    const formattedCode = formatCCode(code);
    writeFileSync(filePath, formattedCode);

    const dockerCommand = `docker run --rm -v ${escapePath(tempDir)}:/code gcc:latest sh -c "cd /code && g++ ${fileName} -o ${fileId} && timeout 10s ./${fileId}"`;
    
    const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 15000 });

    if (stderr && stderr.includes('error:')) {
      return {
        success: false,
        output: '',
        error: `Compilation error: ${stderr.trim()}`,
        executionTime: Date.now() - startTime
      };
    }

    return {
      success: true,
      output: stdout.trim(),
      error: stderr && stderr.includes('warning:') ? stderr.trim() : undefined,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime: Date.now() - startTime
    };
  } finally {
    cleanup(filePath, outputPath);
  }
};

const executeJavaCodeInternal = async (code: string, fileId: string): Promise<ExecutionResult> => {
  const startTime = Date.now();
  const fileName = `Main.java`;
  const filePath = path.join(tempDir, fileName);

  try {
    writeFileSync(filePath, code);

    const dockerCommand = `docker run --rm -v ${escapePath(tempDir)}:/code openjdk:11 sh -c "cd /code && javac Main.java && timeout 10s java Main"`;
    
    const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 15000 });

    return {
      success: true,
      output: stdout.trim(),
      error: stderr ? stderr.trim() : undefined,
      executionTime: Date.now() - startTime
    }
  } finally {
    cleanup(filePath, path.join(tempDir, 'Main.class'));
  }
};

const executePythonCode = async (code: string, fileId: string): Promise<ExecutionResult> => {
  const startTime = Date.now();
  const fileName = `main_${fileId}.py`;
  const filePath = path.join(tempDir, fileName);

  try {
    writeFileSync(filePath, code);

    const dockerCommand = `docker run --rm -v ${escapePath(tempDir)}:/code python:3.9.23-trixie sh -c "cd /code && timeout 10s python ${fileName}"`;
    
    const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 15000 });

    return {
      success: true,
      output: stdout.trim(),
      error: stderr ? stderr.trim() : undefined,
      executionTime: Date.now() - startTime
    };
  } finally {
    cleanup(filePath);
  }
};


const cleanup = (...filePaths: string[]) => {
  filePaths.forEach(filePath => {
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.warn(`Warning: Could not clean up file ${filePath}:`, cleanupError);
    }
  });
};


