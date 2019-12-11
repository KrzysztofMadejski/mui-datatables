import * as React from 'react';
import * as PropTypes from 'prop-types';
import MuiTable from '@material-ui/core/Table';
import TableHead from './TableHead';
import TablePagination from './TablePagination';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { MUIDataTableOptions } from '../index.d';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { NoState } from './NoState';

export interface TableFooterProps { 
  changePage: (page:number)=>void;
  changeRowsPerPage: (rows:number)=>void;

  options: MUIDataTableOptions;
  page: number;  
  rowCount: number;
  rowsPerPage: number; 
}

class TableFooter extends React.Component<TableFooterProps, NoState> {
  static propTypes = {};

  render() {
    const { options, rowCount, page, rowsPerPage, changeRowsPerPage, changePage } = this.props;

    return (
      <MuiTable>
        {options.customFooter
          ? options.customFooter(
              rowCount,
              page,
              rowsPerPage,
              changeRowsPerPage,
              changePage,
              options.textLabels.pagination,
            )
          : options.pagination && (
              <TablePagination
                count={rowCount}
                page={page}
                rowsPerPage={rowsPerPage}
                changeRowsPerPage={changeRowsPerPage}
                changePage={changePage}
                component={'div'}
                options={options}
              />
            )}
      </MuiTable>
    );
  }
}

export default TableFooter;
