# print("Create User Dictionary")

# git log --pretty=format:%ae | grep '.*' | sort --unique
# prints out all emails, then we can use github api to parse
# curl https://api.github.com/search/users?q=email@email.com+in:email