/**
 * triple slash directive
 *
 * ts がファイル間の依存関係を宣言するために使う
 * ファイルの先頭で必ず宣言されなければならない。
 *
 * 使う際は、namespace_name.object_name ( interface_name )
 * と使う。
 *
 * 別ファイルに切り出しても、名前空間を統一すれば、ドット表記で指定しなくても
 * 書けるようにはなる。
 *
 * また、依存関係を解決するために、各ファイルの上に使った外部からの参照ファイルを
 * 個別に記述する。
 */

/**
 * models
 */
/// <reference path="models/drag-drop.ts"/>
/// <reference path="models/project.ts"/>

/**
 * state
 */
/// <reference path="state/project-state.ts"/>

/**
 * utils
 */
/// <reference path="utils/validation.ts"/>

/**
 * decorators
 */
/// <reference path="decorators/autobind.ts"/>

/**
 * components ( namespace: App )
 */
/// <reference path="components/base-component.ts" />
/// <reference path="components/project-input.ts" />
/// <reference path="components/project-list.ts" />
/// <reference path="components/project-item.ts" />

namespace App {
  const prjInput = new Components.ProjectInput();

  const activePrjList = new Components.ProjectList('active');
  const finishedPrjList = new Components.ProjectList('finished');
}
