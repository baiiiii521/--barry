import { Project, SyntaxKind, StringLiteral, JsxText, NoSubstitutionTemplateLiteral } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.tsx');
project.addSourceFilesAtPaths('src/**/*.ts');

const zhRegex = /[\u4e00-\u9fa5]/;

const files = project.getSourceFiles();

const dictionary: Record<string, string> = {};

files.forEach(sourceFile => {
    // Exclude the translate script itself, just in case
    if (sourceFile.getFilePath().includes('translate.ts')) return;

    let modified = false;

    // 1. StringLiterals (e.g. '中文' or "中文")
    sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(node => {
        const text = node.getLiteralValue();
        if (zhRegex.test(text)) {
            // Check parent, if it's an ImportDeclaration, ignore it
            const parent = node.getParent();
            if (parent && parent.getKind() === SyntaxKind.ImportDeclaration) return;
            // If it's a JSX Attribute like placeholder="中文", we need to wrap it in a JsxExpression
            if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
                node.replaceWithText(`{t('${text}')}`);
            } else if (parent && parent.getKind() === SyntaxKind.PropertyAssignment) {
                const parentName = parent.getName();
                // if it's already key: t('val'), don't
                node.replaceWithText(`t('${text}')`);
            } else {
                node.replaceWithText(`t('${text}')`);
            }
            dictionary[text] = text;
            modified = true;
        }
    });

    // 2. JsxText (e.g. <div>中文</div>)
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(node => {
        const text = node.getText();
        if (zhRegex.test(text)) {
             // text could have leading/trailing spaces/newlines
            const trimmed = text.trim();
            if (trimmed) {
                dictionary[trimmed] = trimmed;
                node.replaceWithText(text.replace(trimmed, `{t('${trimmed}')}`));
                modified = true;
            }
        }
    });

    // 3. NoSubstitutionTemplateLiteral (e.g. `中文`)
    sourceFile.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral).forEach(node => {
         const text = node.getLiteralValue();
         if (zhRegex.test(text)) {
             node.replaceWithText(`t('${text}')`);
             dictionary[text] = text;
             modified = true;
         }
    });

    if (modified) {
        // add import { t } from './i18n';
        sourceFile.insertImportDeclaration(0, {
            namedImports: ['t'],
            moduleSpecifier: '@/i18n' // or relative, but let's just use './i18n' for simplicity if in src
        });
        
        // Wait, if it's in a subdirectory like src/components/xxx.tsx, we need relative path
        // For simplicity, let's just use '../i18n' or similar. We only have src/App.tsx, src/VisaTab.tsx, src/lib/NoiseSynth.ts, src/main.tsx, src/holidays.ts
        // Let's calculate relative path
    }
});

// We need to fix imports dynamically
files.forEach(sourceFile => {
    if (sourceFile.getFilePath().includes('translate.ts')) return;
    const imports = sourceFile.getImportDeclarations();
    const hasT = imports.some(imp => imp.getNamedImports().some(n => n.getName() === 't'));
    if (!hasT && sourceFile.getText().includes('t(')) {
        // determine if file is in src or src/lib
        const path = sourceFile.getFilePath();
        const specifier = path.includes('/lib/') ? '../i18n' : './i18n';
        sourceFile.insertImportDeclaration(0, {
            namedImports: ['t'],
            moduleSpecifier: specifier
        });
    }
});

project.saveSync();

const fs = require('fs');
fs.writeFileSync('src/dict.json', JSON.stringify(dictionary, null, 2));

console.log('AST transformation completed.');
