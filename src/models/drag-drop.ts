/**
 * Drag & Drop での実装
 *
 * ・ Drag して要素を移動させる
 * ・移動させた後、裏側でデータを変える
 *
 * この2点を実装する。
 */

namespace DDInterfaces {
  // Drag & Drop
  export interface Draggable {
    /**
     * 移動させる対象
     *
     * ここでは、ProjectItem
     */
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    /**
     * 移動先の対象
     *
     * ここでは、ProjectList
     */
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
  }
}
