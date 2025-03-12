import 'dotenv/config';
import * as readline from 'readline';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const SCRIPT_URL = process.env.SCRIPT_URL || '';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function prompt(question) {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer);
		});
	});
}

async function getAndPostGithubInfoContribution(username) {
	try {
		const query = `
        {
            user(login: "${username}") {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                    }
                }
            }
        }
        `;
		const responseInfoUser = await fetch(
			'https://api.github.com/users/' + username
		);
		const responseGraphqlTotalContributions = await fetch(
			'https://api.github.com/graphql',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${GITHUB_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query }),
			}
		);

		const resultInfoUser = await responseInfoUser.json();
		const resultTotalContributions =
			await responseGraphqlTotalContributions.json();

		const name = resultInfoUser.name || '';
		const total_contributions =
			resultTotalContributions.data.user.contributionsCollection
				.contributionCalendar.totalContributions;

		const forms = new URLSearchParams({
			name,
			username,
			total_contributions,
		});
		const saveToSpreadSheets = await fetch(SCRIPT_URL, {
			method: 'POST',
			body: forms,
		});

		const result = await saveToSpreadSheets.json();
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}

async function main() {
	try {
		for (let i = 0; i < Infinity; i++) {
			const username = await prompt('masukan username:   ');
			const res = await getAndPostGithubInfoContribution(username);
			console.log(res);
		}
	} catch (e) {
		console.error(e);
	} finally {
		rl.close();
	}
}

main();
