import { withStyles, WithStyles } from '@material-ui/core/styles';
import MuiTableHead from '@material-ui/core/TableHead';
import classNames from 'classnames';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import TableHeadCell from './TableHeadCell';
import TableHeadRow from './TableHeadRow';
import TableSelectCell from './TableSelectCell';
import { NoState } from './NoState';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { MUIDataTableColumnState, MUIDataTableOptions, SelectRowUpdateFunc, RowsSubset, DisplayData } from '../index.d';
import { TableCellProps } from '@material-ui/core/TableCell';

const defaultHeadStyles = (theme): Record<string, CSSProperties> => ({
  main: {},
  responsiveStacked: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
});

interface TableHeadProps extends WithStyles<typeof defaultHeadStyles> {
  activeColumn: string | null;
  columns: MUIDataTableColumnState[];
  count: number;  
  data: DisplayData;
  options: MUIDataTableOptions;
  page: number; // TODO not present in propTypes
  rowsPerPage: number; // TODO not present in propTypes 
  selectedRows: RowsSubset;
  selectRowUpdate: SelectRowUpdateFunc;  
  setCellRef: (index:number, el:any) => void;
  toggleSort: (index: number) => void;
}

class TableHead extends React.Component<TableHeadProps, NoState> {
  handleToggleColumn = (index: number):void => {
    this.props.toggleSort(index);
  };

  handleRowSelect = () => {
    this.props.selectRowUpdate('head', null);
  };

  render() {
    const { classes, columns, count, options, data, setCellRef, selectedRows } = this.props;

    const numSelected = (selectedRows && selectedRows.data.length) || 0;
    let isIndeterminate = numSelected > 0 && numSelected < count;
    let isChecked = numSelected === count ? true : false;

    // When the disableToolbarSelect option is true, there can be
    // selected items that aren't visible, so we need to be more
    // precise when determining if the head checkbox should be checked.
    if (options.disableToolbarSelect === true) {
      if (isChecked) {
        for (let ii = 0; ii < data.length; ii++) {
          if (!selectedRows.lookup[data[ii].dataIndex]) {
            isChecked = false;
            isIndeterminate = true;
            break;
          }
        }
      } else {
        if (numSelected > count) {
          isIndeterminate = true;
        }
      }
    }

    return (
      <MuiTableHead
        className={classNames({ [classes.responsiveStacked]: options.responsive === 'stacked', [classes.main]: true })}>
        <TableHeadRow>
          <TableSelectCell
            ref={el => setCellRef(0, findDOMNode(el))}
            onChange={this.handleRowSelect.bind(null)}
            indeterminate={isIndeterminate}
            checked={isChecked}
            isHeaderCell={true}
            expandableOn={options.expandableRows}
            selectableOn={options.selectableRows}
            // @ts-ignore
            fixedHeader={options.fixedHeader}
            fixedHeaderOptions={options.fixedHeaderOptions}
            selectableRowsHeader={options.selectableRowsHeader}
            isRowSelectable={true}
          />
          {columns.map(
            (column, index) =>
              column.display === 'true' &&
              (column.customHeadRender ? (
                column.customHeadRender({ index, ...column }, this.handleToggleColumn)
              ) : (
                <TableHeadCell
                  cellHeaderProps={
                    columns[index].setCellHeaderProps ? columns[index].setCellHeaderProps({ index, ...column }) : {} as TableCellProps
                  }
                  key={index}
                  index={index}
                  type={'cell'}
                  ref={el => setCellRef(index + 1, findDOMNode(el))}
                  sort={column.sort}
                  sortDirection={column.sortDirection}
                  toggleSort={this.handleToggleColumn}
                  hint={column.hint}
                  print={column.print}
                  options={options}
                  column={column}>
                  {column.label}
                </TableHeadCell>
              )),
          )}
        </TableHeadRow>
      </MuiTableHead>
    );
  }
}

export default withStyles(defaultHeadStyles, { name: 'MUIDataTableHead' })(TableHead);
