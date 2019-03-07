let path = require('path'),
    fs = require('fs'),
    nyc = require('nyc'),
    typesPath = path.join(__dirname, 'Types'),
    coveragePath = path.join(require('./package.json')['nyc']['report-dir'], 'coverage.json'),
    coverageAllPath = path.join(__dirname, 'artifacts', 'coverageAll.json'),
    coverageTypesPath = path.join(__dirname, 'artifacts', 'coverageTypes.json'),
    allFiles = [];

// функция пробегает по папке и находит все js файлы
dirWalker = function (dir) {
    let pattern = /\.js$/,
        files = fs.readdirSync(dir),
        newPath = '';
    for (let i = 0; i < files.length; i++) {
        newPath = path.join(dir, files[i]);
        if (fs.statSync(newPath).isDirectory()) {
            dirWalker(newPath);
        } else {
            if (pattern.test(files[i])) {
                allFiles.push(newPath);
            }
        }
    }
};

// пробегаем по папкам Types
dirWalker(typesPath);

let rawCover = fs.readFileSync(coveragePath, 'utf8'),
    cover = JSON.parse(rawCover),
    newCover = {},
    instrumenter = new nyc().instrumenter(),
    transformer = instrumenter.instrumentSync.bind(instrumenter),
    typesFiles = allFiles.filter(file => file.includes('/Types/'));

// функция дописывает 0 покрытие для файлов которые не использовались в тестах
// и меняет относительные пути на абсолютные
function coverFiles(files, replacer) {
    files.forEach(file => {
        let relPath = file.replace(replacer, '').slice(1),
            rootPaths = replacer.split(path.sep),
            rootDir = rootPaths[rootPaths.length - 1],
            key = [rootDir, relPath].join(path.sep),
            coverData = cover[key];
        if (!coverData) {
            try {
                let rawFile = fs.readFileSync(file, 'utf-8');
                transformer(rawFile, file);
                let coverState = instrumenter.lastFileCoverage();
                Object.keys(coverState.s).forEach(key => coverState.s[key] = 0);
                newCover[file] = coverState;
                console.log('File ' + file.replace(__dirname, '').slice(1) + ' not using in tests')
            } catch (err) {
                console.log('File ' + file.replace(__dirname, '').slice(1) + ' can\'t be instrumented, pls try later');
            }
        } else {
            coverData['path'] = file;
            newCover[file] = coverData;
        }
    });
}

// дописываем 0 покрытия для файлов которые не использовались в тестах
coverFiles(typesFiles, typesPath);


// функция возвращает покрытие для опредленного пути
function getCoverByPath(path) {
    let coverageByPath = {};
    Object.keys(newCover).forEach(function (name) {
        if (name.includes(path)) {
            coverageByPath[name] = newCover[name]
        }
    });
    return coverageByPath
}

let typesCoverage = getCoverByPath(typesPath);

// сохраняем покрытие Общее, Router
fs.writeFileSync(coverageAllPath, JSON.stringify(newCover), 'utf8');
fs.writeFileSync(coverageTypesPath, JSON.stringify(typesCoverage), 'utf8');