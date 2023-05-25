//A class that represents a leaf in the BSP tree
class Leaf {
  constructor(X, Y, Width, Height, parent) {
      this.MIN_LEAF_SIZE = 50;
      this.minimumWidth = 20;
      this.minimumHeight = 20;

      this.x = X;
      this.y = Y;
      this.width = Width;
      this.height = Height;
      this.parent = parent;
      this.leftChild = null;
      this.rightChild = null;
      this.room = null;
      this.hall = null;

  }

  //Function used to split the leaf
  split() {
      if (this.leftChild != null || this.rightChild != null) {
          return false; // already split
      }

      const aspectRatio = this.width / this.height;

      if (aspectRatio > 1.5) {
          // split vertically
          const max = Math.floor(this.width - this.MIN_LEAF_SIZE);
          if (max <= this.MIN_LEAF_SIZE) {
              return false; // area too small
          }
          const split = Math.floor(Math.random() * (max - this.MIN_LEAF_SIZE + 1) + this.MIN_LEAF_SIZE);
          this.leftChild = new Leaf(this.x, this.y, split, this.height, this);
          this.rightChild = new Leaf(this.x + split, this.y, this.width - split, this.height, this);
      } else if (aspectRatio < 0.6) {
          // split horizontally
          const max = Math.floor(this.height - this.MIN_LEAF_SIZE);
          if (max <= this.MIN_LEAF_SIZE) {
              return false; // area too small
          }
          const split = Math.floor(Math.random() * (max - this.MIN_LEAF_SIZE + 1) + this.MIN_LEAF_SIZE);
          this.leftChild = new Leaf(this.x, this.y, this.width, split, this);
          this.rightChild = new Leaf(this.x, this.y + split, this.width, this.height - split, this);
      } else {
          // split randomly
          const splitH = Math.random() < 0.5;
          if (splitH) {
              const max = Math.floor(this.height - this.MIN_LEAF_SIZE);
              if (max <= this.MIN_LEAF_SIZE) {
                  return false; // area too small
              }
              const split = Math.floor(Math.random() * (max - this.MIN_LEAF_SIZE + 1) + this.MIN_LEAF_SIZE);
              this.leftChild = new Leaf(this.x, this.y, this.width, split, this);
              this.rightChild = new Leaf(this.x, this.y + split, this.width, this.height - split, this);
          } else {
              const max = Math.floor(this.width - this.MIN_LEAF_SIZE);
              if (max <= this.MIN_LEAF_SIZE) {
                  return false; // area too small
              }
              const split = Math.floor(Math.random() * (max - this.MIN_LEAF_SIZE + 1) + this.MIN_LEAF_SIZE);
              this.leftChild = new Leaf(this.x, this.y, split, this.height, this);
              this.rightChild = new Leaf(this.x + split, this.y, this.width - split, this.height, this);
          }
      }

      return true;
  }

  //Function used to split the leaf evenly
  splitEvenly() {
    if (this.leftChild != null || this.rightChild != null) {
        return false; // already split
    }
  
    if (this.width > this.height) {
        // split vertically
        const split = Math.floor(this.width / 2);
        this.leftChild = new Leaf(this.x, this.y, split, this.height, this);
        this.rightChild = new Leaf(this.x + split, this.y, this.width - split, this.height, this);
    } else {
        // split horizontally
        const split = Math.floor(this.height / 2);
        this.leftChild = new Leaf(this.x, this.y, this.width, split, this);
        this.rightChild = new Leaf(this.x, this.y + split, this.width, this.height - split, this);
    }
  
    return true;
  }

}