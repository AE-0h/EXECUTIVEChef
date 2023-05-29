import fs from "fs";
import path from "path";
import git from "simple-git";
import { encode } from "gpt-3-encoder";

// URL of the Git repository
const repoUrl = "git@github.com:AE-0h/AEH0FOLIO23.git";

// Local path to clone the repository
const localPath = "repo";

// Local path to store token files
const tokenPath = "tokenizedJSLocalStore";

async function tokenize(filePath) {
  const code = await fs.promises.readFile(filePath, "utf8");
  const tokens = encode(code);
  return tokens.map((token) => token.toString()).join("\n");
}

export async function cloneParseOrPullParse() {
  try {
    const gitInstance = git();
    if (!fs.existsSync(localPath)) {
      await gitInstance.clone(repoUrl, localPath);
    } else {
      await gitInstance.cwd(localPath);
      await gitInstance.pull();
    }

    const files = await fs.promises.readdir(localPath);

    for (const file of files) {
      try {
        const filePath = path.join(localPath, file);
        const fileStats = await fs.promises.stat(filePath);
        if (fileStats.isDirectory()) {
          const directoryFiles = await fs.promises.readdir(filePath);
          for (const subFile of directoryFiles) {
            const subFilePath = path.join(filePath, subFile);
            const subFileStats = await fs.promises.stat(subFilePath);
            if (
              !subFileStats.isDirectory() &&
              !subFile.startsWith(".") &&
              path.extname(subFile) === ".js"
            ) {
              const tokens = await tokenize(subFilePath);
              const subFileName = path.basename(subFilePath, ".js");
              const newSubFileName = `${subFileName}_tokens.txt`;
              const newSubFilePath = path.join(tokenPath, newSubFileName);
              await fs.promises.writeFile(newSubFilePath, tokens);
            }
          }
        } else if (
          !file.startsWith(".") &&
          !file.startsWith("package-lock") &&
          !file.startsWith("yarn") &&
          !file.startsWith("node_modules") &&
          path.extname(file) === ".js"
        ) {
          const tokens = await tokenize(filePath);
          const fileName = path.basename(filePath, ".js");
          const newFileName = `${fileName}_tokens.txt`;
          const newFilePath = path.join(tokenPath, newFileName);
          await fs.promises.writeFile(newFilePath, tokens);
        }
      } catch (err) {
        console.error(`Failed to tokenize file : `, err);
      }
    }
  } catch (err) {
    console.error(`Failed to clone, pull or tokenize file : `, err);
  }
}

// Create text files directory if it doesn't exist
if (!fs.existsSync(tokenPath)) {
  fs.mkdirSync(tokenPath, { recursive: true });
}
