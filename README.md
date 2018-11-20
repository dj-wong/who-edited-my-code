# who-edited-my-code
Who edited my code and where are they!

## Requirements
Requirements include:
- Github Authorization 
- Google Maps API Key

Once you have these, set the following environment variables by adding these to your `.bash_profile or .bash_rc`:
```
GITHUB_TOKEN=${Github Token here}; export GITHUB_TOKEN
GMAPS_API_KEY=${Google Maps Key here}; export GMAPS_API_KEY
```

## Installation
Run `npm install` to download all dependencies.

To install python dependencies, it is suggested to use a virtualenv. After, run:
```
cd src/gen-data/python
pip install -r requirements.txt
```

## Usage
There are multiple commands that you can run.

Generates data for the git repo that is passed in:
```
npm run gen-data "${Path to git repo}"
```

If you would like to generate the class structure or the user dictionary separately use:
```
npm run generate-class-structure "${PATH_TO_GIT_REPO}"
npm run generate-user-dictionary "${PATH_TO_GIT_REPO}"
```

To launch the webapp to visualize your data:
```
npm run start
```

To launch the webapp and generate the data, use:
```
npm run start-all ${PATH_TO_GIT_REPO}
```
