const fs = require('fs');
const path = require('path');
const mjml2html = require('mjml');

const fsUtils = require('./fs');

const options = {
    keepComments: true,
    beautify: true,
};

const srcFolder = path.relative(process.cwd(), './views');
const destFolder = path.relative(process.cwd(), './dist');

async function build() {

    await fsUtils.cleanDir(destFolder);
    await fsUtils.makeDir(destFolder);

    console.log(`Searching ${srcFolder}`);

    const files = await fsUtils.readDir(srcFolder + '/*.mjml');
    console.log(`Found ${files.length} files`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log(`Reading ${file}`);
        const data = await fsUtils.readFile(file);
        
        console.log(`Parsing ${file}`);
        const results = mjml2html(data, options);

        if (data.errors) {
            console.error(data.errors);
            return;
        }

        console.log(`Writing ${file}`);
        const filename = path.basename(file, '.mjml');
        await fsUtils.writeFile(`${destFolder}/${filename}.html`, results.html);
    }
}

build();
