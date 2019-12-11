import * as React from 'react';
import classNames from 'classnames';
import TableCell from '@material-ui/core/TableCell';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { MUIDataTableOptions } from '../index.d';
import { string } from 'prop-types';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

const defaultBodyCellStyles = (theme): Record<string, CSSProperties> => ({
  root: {},
  cellHide: {
    display: 'none',
  },
  stackedCommon: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      whiteSpace: 'nowrap',
      fontSize: '16px',
      height: '24px',
      width: 'calc(50% - 80px)',
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:nth-last-child(2)': {
        borderBottom: 'none',
      },
    },
  },
  cellStackedSmall: {
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
  },
  responsiveStackedSmall: {
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
  }, 
});

interface TableBodyCellProps extends WithStyles<typeof defaultBodyCellStyles> {
  options: MUIDataTableOptions;
  colIndex: number;
  dataIndex: number;
  rowIndex: number;  
  className: string;
  print: boolean;
  columnHeader: string;
}

class TableBodyCell extends React.Component<TableBodyCellProps, {}> {
  handleClick = event => {
    const { colIndex, options, children, dataIndex, rowIndex } = this.props;
    if (options.onCellClick) {
      options.onCellClick(children, { colIndex, rowIndex, dataIndex, event });
    }
  };

  render() {
    const {
      children,
      classes,
      colIndex,
      columnHeader,
      options,
      dataIndex,
      rowIndex,
      className,
      print,
      ...otherProps
    } = this.props;

    return [
      <TableCell
        key={1}
        className={classNames(
          {
            [classes.root]: true,
            [classes.cellHide]: true,
            [classes.stackedCommon]: options.responsive === 'stacked',
            [classes.cellStackedSmall]:
              options.responsive === 'stacked' &&
              (options.setTableProps().padding === 'none' || options.setTableProps().size === 'small'),
            'datatables-noprint': !print,
          },
          className,
        )}>
        {columnHeader}
      </TableCell>,
      <TableCell
        key={2}
        onClick={this.handleClick}
        className={classNames(
          {
            [classes.root]: true,
            [classes.stackedCommon]: options.responsive === 'stacked',
            [classes.responsiveStackedSmall]:
              options.responsive === 'stacked' &&
              (options.setTableProps().padding === 'none' || options.setTableProps().size === 'small'),
            'datatables-noprint': !print,
          },
          className,
        )}
        {...otherProps}>
        {children}
      </TableCell>,
    ];
  }
}

export default withStyles(defaultBodyCellStyles, { name: 'MUIDataTableBodyCell' })(TableBodyCell);
