#!/bin/bash

branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ "$branch" != "development" ] ; then
  echo "You must be on the development branch"
  exit 2
fi

# echo "What version number?"
# read version

# if [ "$version" = "" ] ; then
#   echo "You must specify a version number"
#   exit 2
# fi

timestamp=$(date +%s)

buildBranch="release-$timestamp"

git checkout -b $buildBranch
grunt
git add -A
git commit -a -m "Preparing for release."
git checkout master
git merge --no-ff $buildBranch -X theirs -m "Merge branch '$buildBranch' into master"
git tag -a v$timestamp -m 'version $timestamp'

cd build
git commit -a -m 'Release version $timestamp'
cd ..

git checkout development
git branch -D $buildBranch

echo "Deploy to staging? y/n"
read deploy

if [ "$deploy" = "y" ] ; then
  git push staging master
fi

echo "Deploy to Production? y/n"
read deploy

if [ "$deploy" = "y" ] ; then
  cd build
  git push master:gh-pages
  cd ..
fi