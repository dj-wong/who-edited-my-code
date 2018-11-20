import argparse
import os
import re
from git import Repo
from github import Github

def generate_dict(gh, repo):
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

def get_email_user_dict(repo):
    GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

    if GITHUB_TOKEN is None:
        print("No Github key provided, returning None")
        return None

    dictionary = None

    if repo is not None:
        gh = Github(GITHUB_TOKEN)
        dictionary = generate_dict(gh, repo)
    else:
        print("Repo not passed in, exiting...")  
        exit(1)
    
    return dictionary


class EmailUserDictionary():
    def __init__(self):
        self.email_user_dictionary = None
        self.repo = None
    
    def generate_email_user_dictionary(self, path):
        self.repo = Repo(path)
        self.email_user_dictionary = get_email_user_dict(self.repo)

    def get_user_with_email(self, email):
        user_login = None
        if self.email_user_dictionary is not None:
            user_login = self.email_user_dictionary.get(email)
        
        return user_login
        
    def get_committers_for_file(self, file_path):
        print("getting committers for: %s" % file_path)
        
        emails = set()
        for commit, _lines in self.repo.blame("HEAD", file_path):
            emails.add(commit.committer.email)
        
        user_logins = set()
        for email in emails:
            user_login = self.get_user_with_email(email)
            if user_login is not None:
                user_logins.add(user_login)

        return list(user_logins)
