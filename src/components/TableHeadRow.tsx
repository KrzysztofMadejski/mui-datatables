import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import TableRow from '@material-ui/core/TableRow';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { NoState } from './NoState';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

const defaultHeadRowStyles: Record<string, CSSProperties> = {
  root: {},
};

interface TableHeadRowProps extends WithStyles<typeof defaultHeadRowStyles> {
}

class TableHeadRow extends React.Component<TableHeadRowProps, NoState> {
  static propTypes = {
    /** Extend the style applied to components */
    classes: PropTypes.object,
  };

  render() {
    const { classes } = this.props;

    return (
      <TableRow
        className={classNames({
          [classes.root]: true,
        })}>
        {this.props.children}
      </TableRow>
    );
  }
}

export default withStyles(defaultHeadRowStyles, { name: 'MUIDataTableHeadRow' })(TableHeadRow);
