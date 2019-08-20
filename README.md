# salad-map

This repo contains the application files for a [map interactive](https://storymaps.esri.com/lee/salad-days).  The purpose of the interactive is to show the farms from which the salad restaurant Sweetgreen sources ingredients.

## Deployment

The primary file types in this repo are **html**, **css**, and **javascript**.  To deploy, simply copy the folder to a web server directory.

## Notes for developers

* This is a simple [JAMstack](https://jamstack.org/) project, consisting only of vanilla javascript (no frameworks)

* The *html*, *css*, and *javascript* files in this project do not require build scripts.  Source files can be edited and re-deployed with modifications.

	* Note: *Css* developers have an alternative to working with the css code directly. If you're familiar with [Sass](https://sass-lang.com/) (which we use for convenience in developing our css), you can work with the *scss* source files provided (in the *scss* folder).

* Files you can ignore:

	* *Gruntfile.js*: A file that I use to automate some tasks in my own environment.  This file does not directly relate to the mechanics of the application.
	* Source *scss* files in the *scss* folder. If you're not using Sass, you needn't worry about these.
