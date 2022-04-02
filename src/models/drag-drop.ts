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
