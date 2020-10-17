# Growth Demo

This application helps people understand the lag between a drop in people becoming infected, and their outcomes. 

It is based on work undertaken by Katri “Kat” Manninen ( [Engish Twitter](https://twitter.com/katmanninen), [Finnish Twitter](https://twitter.com/kutrinet) ), in particular the diagram that she made demonstrating the typical progression of the disease.

![Typical Progress of COVID-19](covid-typical-progress.jpeg)

This was the clearest demonstration I have ever seen of how the disease progresses, and why there is such a huge lag between infections, cases, hospitalisations, and deaths. It is why this piece of work exists. 

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Disclaimers

* This system does represent my best efforts to accuratly model the amount of time taken between stopping transmission and cases working through the phases of the disease. 
* The system uses a simple number of cases double every n days "model". While this is ok for ballparking, it's not perfect.
* The system assumes a, "average" distribution of cases amongst the population.
    * An outbreak in a care home, or a hospital will probably result in disproportionally more deaths
    * An outbreak in a university or a woman's football club will probably result in disproportionally fewer deaths. 
* This system makes no claims to accuracy. 
    * If you are a professional epidemiologist who is using this, what you should do is use the fact that you don't have any better tooling to bully your employees to paying up more money for something real.
* Stopping transmissions in the app is as simple as unticking the "Spreading" button. This is not something that happens in real life. Stopping the spread even with a lockdown is not perfect, and it is also icredibly difficult to do.
* There are some outliers, in covid cases. In this model
    * No one dies at home with silent hypoxia
    * Recoveries take a maximum of about 60 days from infection. There have been some cases where a patient has been unwell for an extremely long time.
* One people start recovering or dying in the model, new cases won't quite double every _n_ days.
* Long Covid has not been taken account of in this model - there are a significant number of people with a variety of odd symptoms. 
* As treatments improve, hopefully survivability will improve, but I 

## TODOs

* The method `getDistributions` needs to take account of standard deviation, peaking around a known point (e.g. in the case of becoming symptomatic, that should be 5 days)
* A chart must be added
* It would be nice if someone could tweak the numbers around each stage
* We take no account whatsoever or herd immunity, so the script will keep running forever at this stage.

## Pull requests I would accept
* The application is very ugly. If you are willing to spend time making it look a bit neater, than please let me know.
* I would accept a pull request that increases the accuracy of the model, all things being equal.
