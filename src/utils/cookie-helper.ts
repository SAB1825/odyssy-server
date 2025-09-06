// Alternative cookie parsing utility (not needed with cookie-parser)
export const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};
  
  return cookieHeader
    .split(';')
    .reduce((cookies: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
      return cookies;
    }, {});
};

// Usage example:
// const cookies = parseCookies(req.headers.cookie);
// const sessionToken = cookies['odyssy_session_token'];
