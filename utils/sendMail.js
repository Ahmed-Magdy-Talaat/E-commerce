import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import fs from "fs";

export const sendMail = async ({ template, subject, to, data }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.STMP_HOST,
    port: parseInt(process.env.STMP_PORT || "587"),
    service: process.env.STMP_SERVICE,
    auth: {
      user: process.env.STMP_MAIL,
      pass: process.env.STMP_PASS,
    },
  });
  // Get the directory name of the current module
  const currentDir = path.dirname(new URL(import.meta.url).pathname);

  // Construct the template path
  const templatePath = path.join(currentDir, "../mails/", template);
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const html = ejs.render(templateContent, data);
  await transporter.sendMail({
    from: process.env.MAIL,
    subject,
    to,
    html,
  });
};
