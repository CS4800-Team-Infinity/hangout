import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Clear JWT cookie
  res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; Max-Age=0;");

  const redirect =
    typeof req.query.redirect === "string" ? req.query.redirect : "/";

  return res.redirect(302, redirect);
}
