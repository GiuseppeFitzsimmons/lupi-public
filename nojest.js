require('module-alias/register')
const moduleAlias = require('module-alias');

const fs = require('fs');
const getAllFunctions= component => {
    const f=[];
    for (i in component) {
        if (typeof component[i] === 'function') {
            f.push(component[i]);
        }
    }
    return f;
}
const getAllTestables = folder => {
    const folders=fs.readdirSync(folder);
    var result=[];
    folders.forEach(subfolder=>{
        if (subfolder==='test' && fs.lstatSync(`${folder}/${subfolder}`).isDirectory()) {
            const subfolders=fs.readdirSync(`${folder}/${subfolder}`);
            subfolders.forEach(file=>{
                if (!fs.lstatSync(`${folder}/${subfolder}/${file}`).isDirectory() && file.indexOf('.test.')>-1) {
                    result.push(`${folder}/${subfolder}/${file}`);
                }
            })
        } else if (fs.lstatSync(`${folder}/${subfolder}`).isDirectory()) {
            let more=getAllTestables(`${folder}/${subfolder}`);
            result=result.concat(more);
        }
    });
    return result;
}

moduleAlias.addPath(__dirname + '/packages');
moduleAlias.addPath(__dirname + '/back/commonlayer/nodejs/node_modules');
moduleAlias.addAlias('lupi-dal',__dirname + '/packages/lupi-dal')

console.log('__dirname', __dirname + '/packages/lupi-dal')

let allTestables=getAllTestables('./back');

console.log(allTestables);

allTestables.forEach(testable=>{
    let t=require(testable);
    let allFunctions=getAllFunctions(t);
    allFunctions.forEach(_function=>{
        _function()
    })
})

//const brandTests=require('./back/brand/test/brand.test')

//let funcs=getAllFunctions(brandTests);

