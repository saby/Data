import * as Lint from 'tslint';
import * as ts from 'typescript';

interface IJsDocNode extends ts.Node {
    jsDoc: ts.NodeArray<ITagsNode>;
}

interface ITagsNode extends ts.Node {
    tags: ts.NodeArray<ts.JSDocTag>;
}

export class Rule extends Lint.Rules.AbstractRule {
   apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithWalker(new DocLibraryIncludesWalker(sourceFile, this.getOptions()));
   }
}

// The walker takes care of all the work.
class DocLibraryIncludesWalker extends Lint.RuleWalker {
    walk(node: ts.Node): void {
        ts.forEachChild(node, (child: IJsDocNode) => {
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
