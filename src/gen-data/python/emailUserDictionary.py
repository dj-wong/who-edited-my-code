import argparse
import os
import re
from git import Repo
from github import Github

def __generate_dict(gh, path):
        repo = Repo(path)

        repo_repo_url = repo.remotes.origin.url
        repo_name = re.search(":(.*).git", repo_repo_url).group(1)
        print("Querying against %s github repository..." % repo_name)
        
        github_repo = gh.get_repo(repo_name)

        commits = repo.iter_commits('--all')

        email_commitSHA_map = dict()
        for commit in commits:
            email = commit.committer.email
            if email not in email_commitSHA_map:
                email_commitSHA_map[email] = set()
            authorCommits = email_commitSHA_map.get(email)
            authorCommits.add(commit.hexsha)

        print("Found %i committers!  Generating email_user_dict now..." % len(email_commitSHA_map))
        
        email_user_dict = dict()
        for email, commitSHAs in email_commitSHA_map.items():
            should_not_skip = re.search("github.com", email, re.IGNORECASE) is None

            if should_not_skip: 
                first_SHA = list(commitSHAs)[0]
                print("\temail: %s, SHA: %s" % (email, first_SHA))
                commit = github_repo.get_commit(sha=first_SHA)
                committer = commit.committer
                committer_login = None
                if committer:
                    committer_login = committer.login
                else: 
                    print("\t\tCould not find associated github login, fallback to committer's git config user.name")
                    committer_login = commit.commit.author.name
                
                email_user_dict[email] = committer_login

                print("\tLinking email:%s to committer_login: %s for SHA: %s" % (email, committer, first_SHA))
            else: 
                print("\tSkipping email: %s" % email)

        
        print(email_user_dict)
        return email_user_dict

def get_email_user_dict(path):
    GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

    if GITHUB_TOKEN is None:
        print("No Github key provided, returning None")
        return None

    dictionary = None

    if path != "":
        gh = Github(GITHUB_TOKEN)
        dictionary = __generate_dict(gh, path)
    else:
        print("Empty String as path passed in, exiting...")  
        exit(1)
    
    return dictionary


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--path', required=True)

    io_args = parser.parse_args()
    path = io_args.path

    print("Not the intended way of using it, not saving results to disk")
    print("But here's the result:")
    print(get_email_user_dict(path))