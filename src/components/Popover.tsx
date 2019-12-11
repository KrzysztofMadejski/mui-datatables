import * as React from 'react';
import * as PropTypes from 'prop-types';
import MuiPopover, { PopoverOrigin, PopoverActions } from '@material-ui/core/Popover';
import { findDOMNode } from 'react-dom';

interface PopoverProps {
  className?: string;
  trigger: React.ReactElement;
  content: React.ReactElement;

  refClose?: (closeCb: (cb: () => any) => void) => void;
  refExit: () => void;
}

interface PopoverState {
  open: boolean;
}

class Popover extends React.Component<PopoverProps, PopoverState> {
  anchorEl: null | HTMLElement;
  anchorReactEl: React.ReactInstance | null; // TODO use it instead of anchorEl in some places, or better rewrite handling of both
  popoverActions: PopoverActions;

  state = {
    open: false,
  };

  UNSAFE_componentWillMount() {
    this.anchorEl = null;
  }

  componentDidMount() {
    if (this.props.refClose) {
      this.props.refClose(this.handleRequestClose);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    /*
     * Update Popover position if a filter removes data from the table because
     * it affects the window height which would cause the Popover to in the wrong place
     */
    if (this.state.open === true) {
      this.anchorEl = findDOMNode(this.anchorEl); // TODO mismatch in types here (argument should be anchorReactEl), I'd suggest rewriting all anchorEl handling
      this.popoverActions.updatePosition();
    }
  }

  handleClick = () => {
    this.anchorEl = findDOMNode(this.anchorEl);  // TODO mismatch in types here
    this.setState({ open: true });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  handleOnExit = () => {
    if (this.props.refExit) {
      this.props.refExit();
    }
  };

  render() {
    const { className, trigger, refExit, content, ...providedProps } = this.props;

    const transformOriginSpecs: PopoverOrigin = {
      vertical: 'top',
      horizontal: 'center',
    };

    const anchorOriginSpecs: PopoverOrigin = {
      vertical: 'bottom',
      horizontal: 'center',
    };

    const triggerEl = React.cloneElement(<span>{trigger}</span>, {
      key: 'content',
      ref: el => (this.anchorEl = el),
      onClick: () => {
        if (trigger.props.onClick) trigger.props.onClick();
        this.handleClick();
      },
    });

    return (
      <React.Fragment>
        <MuiPopover
          action={actions => (this.popoverActions = actions)}
          elevation={2}
          open={this.state.open}
          onClose={this.handleRequestClose}
          onExited={this.handleOnExit}
          anchorEl={this.anchorEl}
          ref={el => this.popoverEl} // TODO property popoverEl does not exist on Popover
          anchorOrigin={anchorOriginSpecs}
          transformOrigin={transformOriginSpecs}
          {...providedProps}>
          {content}
        </MuiPopover>
        {triggerEl}
      </React.Fragment>
    );
  }
}

export default Popover;
