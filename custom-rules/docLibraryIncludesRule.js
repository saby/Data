"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
const Lint = require("tslint");
const ts = require("typescript");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new DocLibraryIncludesWalker(sourceFile, this.getOptions()));
    }
}
exports.Rule = Rule;
// The walker takes care of all the work.
class DocLibraryIncludesWalker extends Lint.RuleWalker {
    walk(node) {
        ts.forEachChild(node, (child) => {
            if (child.jsDoc) {
                const tags = child.jsDoc[0].tags;
                let isLibary = false;
                const includes = new Set();
                if (tags) {
                    tags.forEach((tag) => {
                        if (tag.tagName.escapedText === 'library') {
                            isLibary = true;
                        }
                        if (tag.tagName.escapedText === 'include') {
                            this.addFailure(this.createFailure(tag.getStart(), tag.getWidth(), 'Tag @include is not supported. Do you mean tag @includes?'));
                        }
                        if (tag.tagName.escapedText === 'includes') {
                            const parts = (tag.comment || '').split(' ');
                            if (parts.length !== 2) {
                                this.addFailure(this.createFailure(tag.getStart(), tag.getWidth(), 'Tag @includes has incorrect format. Usage: @includes Alias ClassName'));
                            }
                            const includeName = parts[0];
                            if (isLibary && includes.has(includeName)) {
                                this.addFailure(this.createFailure(tag.getStart(), tag.getWidth(), `Tag @includes '${tag.comment}' is not unique in this library. Check all includes`));
                            }
                            includes.add(includeName);
                        }
                    });
                }
            }
        });
    }
}
