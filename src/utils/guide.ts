import fs from 'fs';
import path, { join } from 'path';
import matter from 'gray-matter';
const marked = require('marked');


// create a variable that points to the directory where the guides are stored (Relative path: resources)
const guideDirectory = path.join(process.cwd(), 'resources');

export function getGuideSlugs() {
    return fs.readdirSync(guideDirectory);
}

function getAllFiles(dirPath: any, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath as never);
        }
    });

    return arrayOfFiles;
}

export function getSortedGuides() {
    const allFiles = getAllFiles(guideDirectory);

    const all = allFiles.map(filePath => {
        const relativePath = path.relative(guideDirectory, filePath);
        const id = relativePath.replace(/\.md$/, '');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const matterResult = matter(fileContents);

        return {
            id,
            ...matterResult.data,
            path: `/guide/${id.replace(/\\/g, '/')}`
        };
    });

    return all;
}

export async function getGuideData(id: string) {
    const fullPath = join(guideDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);


    const processedContent = await marked.parse(matterResult.content);

    return {
        id,
        content: processedContent,
        ...matterResult.data
    };

}

export async function getGuides_Name_Slug() {
    const allFiles = getAllFiles(guideDirectory);

    const all = allFiles.map(filePath => {
        const relativePath = path.relative(guideDirectory, filePath);
        const id = relativePath.replace(/\.md$/, '');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const matterResult = matter(fileContents);

        return {
            id,
            ...matterResult.data,
            path: `/guide/${id.replace(/\\/g, '/')}`
        };
    });

    return all;
}
