import fs from 'fs'

fs.readFile('package.json', 'utf-8', (err, data) => {
    if (err) {
        return;
    }
    const versions = JSON.parse(data)
    console.log(versions['version'])
})