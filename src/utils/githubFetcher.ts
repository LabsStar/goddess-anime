/**
 * @file githubFetcher.ts
 * @description Fetches data from the Github API
 * @license CC0-1.0
 * @version 0.0.1
 * @since 0.0.1
 * @disciaimer This file is not in use at the moment.
 */


import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});


export default async function fetchGithubRepo(repo: string, owner?: string) {
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