export default function decorate(block) {
    const lastUpdateElement = document.querySelector('.article-metadata-wrapper .article-metadata');
    const lastUpdateText = lastUpdateElement.textContent.trim();
    // console.log(lastUpdateText); 
    // console.log(lastUpdateElement)   
    const datePattern = /Last update: (.+)/;
    const match = lastUpdateText.match(datePattern);
    const lastUpdateDate = match ? match[1] : '';
    // const lastUpdate = Date.parse(lastUpdateDate);
    var lastUpdate = new Date(lastUpdateDate).toISOString();
    console.log("lastupdated",lastUpdate);
    // if (isNaN(lastUpdate) === false) 
    // {
    //     console.log("enter")
    //     console.log(lastUpdate+'T00:00:00Z')
    //     const formatedDate = new Intl.DateTimeFormat('en', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(lastUpdate)); 
    //     console.log("formateddate",formatedDate)
    //     lastUpdateElement.innerHTML = `<div><div>Last update: ${formatedDate}</div></div>`
    // }
    const date = new Date(lastUpdate); // this you are already getting
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    console.log(formattedDate);
    lastUpdateElement.innerHTML = `<div><div>Last update: ${formattedDate}</div></div>`

}
