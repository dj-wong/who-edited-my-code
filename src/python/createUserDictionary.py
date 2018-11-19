print("Create User Dictionary")

# git log --pretty=format:%ae | grep '.*' | sort --unique
# The list of user email passed in by script.sh
# curl https://api.github.com/search/users?q=email@email.com+in:email
#TODO: use the second end point below with username
# https://api.github.com/users/<username>

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

def addToUserDictitorary(username):
    res = requests.get('https://api.github.com/users/'+username)
    user = json.loads(res.text)

    if "location" in user :
        userDictionary["users_location"][username] = user
    else:
        userDictionary["users_no_location"][username] = user

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
        addToUserDictitorary(username)
    #welp too bad we search using email
    else:
        res = requests.get('https://api.github.com/search/users?q='+email+"+in:email")
        #this api is kinda unreliable as of now
        userSearch = json.loads(res.text)
        if userSearch["total_count"] > 0:
            username = userSearch["items"][0]["login"]
            addToUserDictitorary(username)

print(userDictionary)
