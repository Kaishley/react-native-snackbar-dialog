import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import SnackBar from './SnackBar';

// tslint:disable:no-empty

export default class SnackBarManager {
  constructor () {
    this.current = null;
    this.currentProps = null;
    this.queue = [];
  }

  _setCurrent = (props, callback = () => {}) => {
    if (!('onAutoDismiss' in props)) {
      props.onAutoDismiss = this.dismiss;
    }

    const current = new RootSiblings(<SnackBar {...props} />);
    this.current = current;
    this.currentProps = props;
    callback();
  }

  _removeCurrent = (callback = () => {}) => {
    if (!this.current) {
      callback();
      return;
    }

    this.current.destroy(() => {
      this.current = null;
      this.currentProps = null;
      callback();
    });
  }

  get = () => {
    return {
      current: this.current,
      currentProps: this.currentProps,
      queue: this.queue
    };
  }

  add = (title, options = {}, callback = () => {}) => {
    const props = { title, ...options };

    if (this.current) {
      this.queue.push(props);
      callback();
      return;
    }

    this._setCurrent(props, callback);
  }

  show = (title, options = {}, callback = () => {}) => {
    const props = { title, ...options };

    if (this.current) {
      if (this._isItemAlreadyExistById(props)) {
        return;
      }
      this.queue.unshift(props);
      callback();
      return;
    }

    this._setCurrent(props, callback);
  }

  dismiss = (callback = () => {}) => {
    this._removeCurrent(() => {
      if (!this.queue.length) {
        callback();
        return;
      }

      const current = this.queue.shift();
      this._setCurrent(current, callback);
    });
  }

  _isItemAlreadyExistById = (props) => {
    return props.id && (this.queue.find(item => item.id === props.id) || this.currentProps.id === props.id);
  }
}
