import { Resend } from "resend";
import { Env } from "../config/env-config";

const resend  =  new Resend(Env.RESEND_API_KEY);

export default resend;