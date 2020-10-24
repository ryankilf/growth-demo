# Growth Demo

This application helps people understand the lag between a drop in people becoming infected, and their outcomes. 

It is based on work undertaken by Katri “Kat” Manninen ( [Engish Twitter](https://twitter.com/katmanninen), [Finnish Twitter](https://twitter.com/kutrinet) ), in particular the diagram that she made demonstrating the typical progression of the disease.

![Typical Progress of COVID-19](covid-typical-progress.jpeg)

This was the clearest demonstration I have ever seen of how the disease progresses, and why there is such a huge lag between infections, cases, hospitalisations, and deaths. 
The application I have built is based hugely on Katri's work. 

## Development
This is an angular application. You will need to have `angular/cli` installed globally.
1. Clone the project on your local machine
2. run `npm install`, 
3. `ng serve` to create a dev server. Navigate to `http://localhost:4200/`. 

The app will automatically reload if you change any of the source files.

## Disclaimers

* This system does represent my best efforts to accurately model the amount of time taken between stopping transmission and cases working through the phases of the disease. 
* The system uses a simple number of cases double every n days "model". While this is ok for ball-parking, it's not perfect.
* The system assumes a, "average" distribution of cases amongst the population.
    * An outbreak in a care home, or a hospital will probably result in disproportionally more deaths
    * An outbreak in a university or a woman's football club will probably result in disproportionally fewer deaths. 
* This system makes no claims to accuracy. 
    * If you are a professional epidemiologist who is using this, what you should do is use the fact that you don't have any better tooling to bully your employees to paying up more money for something real.
* Stopping transmissions in the app is as simple as unticking the "Spreading" button. This is not something that happens in real life. Stopping the spread even with a lockdown is not perfect, and it is also incredibly difficult to do.
* There are some outliers, in covid cases. In this model:
    * No one dies at home with silent hypoxia
    * Recoveries take a maximum of about 60 days from infection. There have been some cases where a patient has been unwell for an extremely long time.
* One people start recovering or dying in the model, new cases won't quite double every _n_ days.
* Long Covid has not been taken account of in this model - there are a significant number of people with a variety of odd symptoms. 
* Everyone hopes that as treatments improve, hopefully survivability will continue to improve.
    * I really hope that I have to continue to tweak numbers for this tool as that happens.
* It uses rounding and fractions of patients. Expect rounding errors in the results.

## TODOs

* A chart should be added. I attempted to use Chart.JS, but it was not performant enough, very possibly because I was
was not thinking enough about performance. I will continue to try to find something.
* It would be nice if someone could tweak the numbers around each stage within their browser.
* We take no account whatsoever or herd immunity, or population, so the script will keep running forever at this stage.

## Pull requests I would accept
* The application is very ugly. If you are willing to spend time making it look a bit neater, than please let me know.
* I would accept a pull request that increases the accuracy of the model, all things being equal. If you are willing to do that
work please let me know and understand the sources that you wish to use first of all. I will not accept a speculative PR on this.
* The way that the number of infections increase is pretty unsophisticated. Ideally it would take account of when people become at their
most infectious, rather than simply doubling every n days. It would probably be better if it was based on R, instead.  
* It is _not very good_ on mobile. While some of this will be due to the amount of data, I would accept PRs which improve the 
experience on mobile.

You can contact me on twitter to discuss these things. [@ryankilf](https://twitter.com/ryankilf).
