/**
 * @file githubFetcher.ts
 * @description Fetches data from the Github API
 * @license CC0-1.0
 * @version 0.0.1
 * @since 0.0.1
 * @disciaimer This file is not in use at the moment.
 */


import { Octokit } from '@octokit/rest';
import axios from 'axios';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});


export async function fetchGithubRepo(repo: string, owner?: string) {
    const { data } = await octokit.repos.get({
        owner: owner || 'LabsStar',
        repo,
    });

    return data;
}


export async function fetchGithubRepoContributors(repo: string, owner?: string) {
    const { data } = await octokit.repos.listContributors({
        owner: owner || 'LabsStar',
        repo,
    });

    return data;
}

export async function fetchGithubUser(username: string) {
    const { data } = await octokit.users.getByUsername({
        username,
    });

    return data;
}

export async function fetchGithubUserRepos(username: string) {
    const { data } = await octokit.repos.listForUser({
        username,
    });

    return data;
}

export async function getGithubRepoInfo(repo: string, owner?: string, locale?: string) {
    const { data } = await octokit.repos.get({
        owner: owner || 'LabsStar',
        repo,
    });

    const sizeConversion = (size: number) => {
        if (size > 1000000) {
            return `${Math.round(size / 1000000)} MB`;
        } else if (size > 1000) {
            return `${Math.round(size / 1000)} KB`;
        } else {
            return `${size} B`;
        }
    };

    const formatedDate = (date: string, withTime: boolean, locale: string) => {
        const dateObj = new Date(date);
        if (!withTime) return dateObj.toLocaleDateString(locale);

        return dateObj.toLocaleString(locale);
    };

    const repoInfo = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        issues: data.open_issues_count,
        size: sizeConversion(data.size),
        language: data.language,
        license: data.license?.name,
        pullRequests: data.open_issues_count,
        watchers: data.watchers_count,
        createdAt: formatedDate(data.created_at, false, locale || "en-US"),
        recentCommit: formatedDate(data.pushed_at, true, locale || "en-US"),
    }

    return repoInfo;
}