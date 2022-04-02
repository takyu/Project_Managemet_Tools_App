/**
 * Webpack
 *
 * 全ての import のファイル名の拡張子を削除する。
 */

import { ProjectInput } from './components/project-input';
import { ProjectList } from './components/project-list';

const prjInput = new ProjectInput();

const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
