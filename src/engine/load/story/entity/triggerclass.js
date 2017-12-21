'use strict';

/** 
 * Class for a trigger, which identifies a single value or 
 * the relationship between two relationships.
 */
class Trigger {
  
  constructor(trigger) {
    this.left = '';
    this.right = '';
    this.isTransition = false;
    this.isBidirectional = false;
    this.readableName = '';
    this.parseTrigger(trigger);
  }

  /**
   * Populates the attributes based off of the trigger.
   * @param {string} trigger The unparsed trigger.
   * @returns {undefined}
   */
  parseTrigger(trigger) {
    // Triggers can be the following format:
    //    left -- right (from left to right, right to left)
    //    left -> right (from left to right)
    //    left (for only left)
    //    left: readableName

    if (trigger.includes('--')) {
      [this.left, this.right] = trigger.split('--').map(s => s.trim());
      this.isBidirectional = true;
      this.isTransition = true;
    } else if (trigger.includes('->')) {
      [this.left, this.right] = trigger.split('->').map(s => s.trim());
      this.isBidirectional = false;
      this.isTransition = true;
    } else {
      this.left = trigger;
    }

    if (this.left.includes(':')) {
      [this.left, this.readableName] = this.left.split(':').map(s => s.trim());
    } else {
      this.readableName = this.left;
    }
  }
}

exports.Trigger = Trigger;