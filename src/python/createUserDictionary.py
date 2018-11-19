print("Create User Dictionary")

# git log --pretty=format:%ae | grep '.*' | sort --unique
# The list of user email passed in by script.sh
# curl https://api.github.com/search/users?q=email@email.com+in:email

import git
import sys
import requests
import re
import json

#parameters directly passed into Python overview
print ("This is the name of the script: ", sys.argv[0])
print ("Number of arguments: ", len(sys.argv))
print ("The arguments are: " , str(sys.argv))
path = sys.argv[1]
userDictionary = {"users_location": {}, "users_no_location":{}}

def addToUserDictitorary(user, searchTerm):
    #TODO test users with locations from github API
    if user["total_count"] == 1:
        if "location" in user["items"][0] :
            userDictionary["users_location"][searchTerm] = user["items"][0]
        else:
            userDictionary["users_no_location"][searchTerm] = user["items"][0]

g = git.Git(path)
lograw = g.log()
loginfo = g.log("--pretty=format:%ae")
#Getting unique sets of emails from git log
emails = set(loginfo.splitlines())
print(emails)

for email in emails:
    #matching for github.com email so we can search using username instead
    m = re.search('(.+?)@users.noreply.github.com', email)
    if m :
        username = m.group(1)
        searchTerm = username
    #welp too bad we search using email
    else:
        searchTerm = email
    res = requests.get('https://api.github.com/search/users?q='+searchTerm)
    user = json.loads(res.text)
    addToUserDictitorary(user, searchTerm)
print(userDictionary)
