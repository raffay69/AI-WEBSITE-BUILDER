interface ParsedProject {
  projectName: string;
  files: Record<string, string>;
  fileOrder: string[];
}

export function parseProjectString(input: string): ParsedProject {
  // First extract project name using a more robust regex
  const projectNameMatch = input.match(/^Project Name: (.+?)(\n|$)/);
  const projectName = projectNameMatch?.[1]?.trim() || "";

  // Remove project name from the input before processing files
  const cleanedInput = input.replace(/^Project Name: .+?(\n|$)/, "");

  // Split files using lookbehind assertion to handle different line endings
  const fileSections = cleanedInput
    .split(/(?:\n|^)File: /g)
    .filter((s) => s.trim());

  const files: Record<string, string> = {};
  const fileOrder: string[] = [];

  for (const section of fileSections) {
    const firstNewline = section.indexOf("\n");
    const fileName =
      firstNewline === -1
        ? section.trim()
        : section.slice(0, firstNewline).trim();
    const content =
      firstNewline === -1 ? "" : section.slice(firstNewline + 1).trim();

    if (fileName) {
      files[fileName] = content;
      if (!fileOrder.includes(fileName)) {
        fileOrder.push(fileName);
      }
    }
  }

  return { projectName, files, fileOrder };
}

export function mergeProjects(
  existing: ParsedProject,
  partialUpdate: ParsedProject
): ParsedProject {
  // Merge files (new files overwrite existing ones)
  const mergedFiles = { ...existing.files, ...partialUpdate.files };

  // Preserve original order, append new files at the end
  const mergedFileOrder = [...existing.fileOrder];
  for (const fileName of partialUpdate.fileOrder) {
    if (!mergedFileOrder.includes(fileName)) {
      mergedFileOrder.push(fileName);
    }
  }

  return {
    projectName: existing.projectName,
    files: mergedFiles,
    fileOrder: mergedFileOrder,
  };
}

export function stringifyProject(project: ParsedProject): string {
  let output = `Project Name: ${project.projectName}\n\n`; // Use double newline after project name

  for (const fileName of project.fileOrder) {
    const content = project.files[fileName]?.trim();
    if (!content) {
      console.warn(`Skipping empty file: ${fileName}`);
      continue;
    }
    output += `File: ${fileName}\n${content}\n\n`;
  }

  return output.trim();
}
