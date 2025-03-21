import {
  shellscript
} from "./chunk-ZSPBG333.js";
import "./chunk-BSPL5VGI.js";

// node_modules/shiki/dist/langs/git-rebase.mjs
var lang = Object.freeze({ "displayName": "Git Rebase Message", "name": "git-rebase", "patterns": [{ "captures": { "1": { "name": "punctuation.definition.comment.git-rebase" } }, "match": "^\\s*(#).*$\\n?", "name": "comment.line.number-sign.git-rebase" }, { "captures": { "1": { "name": "support.function.git-rebase" }, "2": { "name": "constant.sha.git-rebase" }, "3": { "name": "meta.commit-message.git-rebase" } }, "match": "^\\s*(pick|p|reword|r|edit|e|squash|s|fixup|f|drop|d)\\s+([0-9a-f]+)\\s+(.*)$", "name": "meta.commit-command.git-rebase" }, { "captures": { "1": { "name": "support.function.git-rebase" }, "2": { "patterns": [{ "include": "source.shell" }] } }, "match": "^\\s*(exec|x)\\s+(.*)$", "name": "meta.commit-command.git-rebase" }, { "captures": { "1": { "name": "support.function.git-rebase" } }, "match": "^\\s*(break|b)\\s*$", "name": "meta.commit-command.git-rebase" }], "scopeName": "text.git-rebase", "embeddedLangs": ["shellscript"] });
var gitRebase = [
  ...shellscript,
  lang
];
export {
  gitRebase as default
};
//# sourceMappingURL=git-rebase-JTFKY57W.js.map
