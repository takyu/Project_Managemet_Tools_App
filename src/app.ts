/**
 * ES Modules
 *
 * import {} from 'file_path'
 *
 * 「namespace の問題点」
 *
 *・人力で全てのファイルに依存関係を書かなければならない。
 *
 *・他ファイルで依存関係の記入ミスがあったとしても、コンパイラがエラーを示さないので、
 * ランタイムエラーの潜在性を秘めている。
 *
 * → ES6から導入された ES Modules を使えば、これらの問題を解決することができる。
 *
 * また、import する際のファイルパスに対して、Webpack やビルドツールなどを用いれば、
 * 拡張子を書かなくても良いが、ブラウザ側で ESModule のファイルを import する場合は、
 * 拡張子をつけなければならない。
 */
import { ProjectInput } from './components/project-input.js';
import { ProjectList } from './components/project-list.js';

const prjInput = new ProjectInput();

const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
