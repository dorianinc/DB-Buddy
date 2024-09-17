
const columns = row.locator("td");
console.log("🖥️  columns: ", await columns.nth(0).innerText());
const columnCount = await columns.count()
for(let i = 0; i < columnCount; i++){
    const obj = {}
    obj.name = await columns.nth(1).innerText();
    obj.type =  await columns.nth(1).innerText();
    obj.lastDeployed = await columns.nth(4).innerText();

}
const type = await columns.nth(1).innerText();
console.log("🖥️  type: ", type)

if (type === "PostgreSQL") {
    const lastDeployed = await columns.nth(4).innerText();
    const daysSince = lastDeployed.split(" ").shift();
    console.log("🖥️  daysSince: ", daysSince)

    if(daysSince >= 30){
        console.log("Your Database has expired")
    }else{
        console.log("Your Database is still active")
    }
  }
