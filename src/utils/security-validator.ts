// Enhanced code security validation
const DANGEROUS_PATTERNS = [
  // File system operations
  /rm\s+-rf/gi,
  /del\s+\/[sf]/gi,
  /format\s+[a-z]:/gi,
  
  // Network operations
  /wget|curl|fetch/gi,
  /socket|connect|bind/gi,
  
  // System calls
  /system\s*\(/gi,
  /exec\s*\(/gi,
  /eval\s*\(/gi,
  /subprocess/gi,
  
  // File operations
  /fopen|fwrite|fread/gi,
  /open\s*\(/gi,
  /write\s*\(/gi,
  
  // Infinite loops (basic detection)
  /while\s*\(\s*true\s*\)/gi,
  /for\s*\(\s*;\s*;\s*\)/gi,
];

export const validateCodeSecurity = (code: string, language: string): { isValid: boolean; reason?: string } => {
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      return {
        isValid: false,
        reason: `Potentially dangerous operation detected: ${pattern.source}`
      };
    }
  }

  // Language-specific validations
  switch (language.toLowerCase()) {
    case 'python':
      return validatePythonCode(code);
    case 'c':
    case 'cpp':
    case 'c++':
      return validateCCode(code);
    case 'java':
      return validateJavaCode(code);
    default:
      return { isValid: true };
  }
};

const validatePythonCode = (code: string): { isValid: boolean; reason?: string } => {
  const pythonDangerous = [
    /import\s+os/gi,
    /import\s+subprocess/gi,
    /import\s+sys/gi,
    /from\s+os/gi,
    /__import__/gi,
  ];

  for (const pattern of pythonDangerous) {
    if (pattern.test(code)) {
      return {
        isValid: false,
        reason: 'Restricted import detected'
      };
    }
  }

  return { isValid: true };
};

const validateCCode = (code: string): { isValid: boolean; reason?: string } => {
  const cDangerous = [
    /#include\s*<sys\//gi,
    /#include\s*<unistd\.h>/gi,
    /fork\s*\(/gi,
    /malloc\s*\(/gi, // Could cause memory issues
  ];

  for (const pattern of cDangerous) {
    if (pattern.test(code)) {
      return {
        isValid: false,
        reason: 'Restricted system call or header detected'
      };
    }
  }

  return { isValid: true };
};

const validateJavaCode = (code: string): { isValid: boolean; reason?: string } => {
  const javaDangerous = [
    /java\.io\.File/gi,
    /java\.lang\.Runtime/gi,
    /java\.lang\.ProcessBuilder/gi,
    /System\.exit/gi,
  ];

  for (const pattern of javaDangerous) {
    if (pattern.test(code)) {
      return {
        isValid: false,
        reason: 'Restricted Java API detected'
      };
    }
  }

  return { isValid: true };
};
