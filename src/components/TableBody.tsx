import * as React from 'react';
import * as PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiTableBody from '@material-ui/core/TableBody';
import TableBodyCell from './TableBodyCell';
import TableBodyRow from './TableBodyRow';
import TableSelectCell from './TableSelectCell';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import cloneDeep from 'lodash.clonedeep';
import { getPageValue } from '../utils';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { NoState } from './NoState';
import { MUIDataTableOptions, RowsSubset, Lookup, RowMeta, SelectRowUpdateFunc, MUIDataTableColumnDef, MUIDataTableColumnState, DisplayData } from '../index.d';

const defaultBodyStyles: Record<string, CSSProperties> = {
  root: {},
  emptyTitle: {
    textAlign: 'center',
  },
};

interface TableBodyProps extends WithStyles<typeof defaultBodyStyles> {
  columns: MUIDataTableColumnState[];
  data: DisplayData;
  count: number;  
  expandedRows: RowsSubset;
  onRowClick?: (rowData: string[], rowMeta: RowMeta) => void;
  options: MUIDataTableOptions;
  page: number; // TODO not present in propTypes
  previousSelectedRow?: { index: number }; 
  rowsPerPage: number; // TODO not present in propTypes 
  selectedRows: RowsSubset;
  selectRowUpdate: SelectRowUpdateFunc;
  toggleExpandRow: (lookup: Lookup) => any;
}

class TableBody extends React.Component<TableBodyProps, NoState> {
  static propTypes = {
    /** Data used to describe table */
    data: PropTypes.array.isRequired,
    /** Total number of data rows */
    count: PropTypes.number.isRequired,
    /** Columns used to describe table */
    columns: PropTypes.array.isRequired,
    /** Options used to describe table */
    options: PropTypes.object.isRequired,
    /** Callback to execute when row is clicked */
    onRowClick: PropTypes.func,
    /** Table rows expanded */
    expandedRows: PropTypes.object,
    /** Table rows selected */
    selectedRows: PropTypes.object,
    /** Callback to trigger table row select */
    selectRowUpdate: PropTypes.func,
    /** The most recent row to have been selected/unselected */
    previousSelectedRow: PropTypes.object,
    /** Toggle row expandable */
    toggleExpandRow: PropTypes.func,
    /** Extend the style applied to components */
    classes: PropTypes.object,
  };

  static defaultProps = {
    toggleExpandRow: () => {},
  };

  buildRows() {
    const { data, page, rowsPerPage, count } = this.props;

    if (this.props.options.serverSide) return data.length ? data : null;

    let rows: any[] = [];
    const highestPageInRange = getPageValue(count, rowsPerPage, page);
    const fromIndex = highestPageInRange === 0 ? 0 : highestPageInRange * rowsPerPage;
    const toIndex = Math.min(count, (highestPageInRange + 1) * rowsPerPage);

    if (page > highestPageInRange) {
      console.warn('Current page is out of range, using the highest page that is in range instead.');
    }

    for (let rowIndex = fromIndex; rowIndex < count && rowIndex < toIndex; rowIndex++) {
      if (data[rowIndex] !== undefined) rows.push(data[rowIndex]);
    }

    return rows.length ? rows : null;
  }

  getRowIndex(index: number): number {
    const { page, rowsPerPage, options } = this.props;

    if (options.serverSide) {
      return index;
    }

    const startIndex = page === 0 ? 0 : page * rowsPerPage;
    return startIndex + index;
  }

  isRowSelected(dataIndex: number): boolean {
    const { selectedRows } = this.props;
    return selectedRows.lookup && dataIndex in selectedRows.lookup && selectedRows.lookup[dataIndex];
  }

  isRowExpanded(dataIndex: number): boolean {
    const { expandedRows } = this.props;
    return expandedRows.lookup && dataIndex in expandedRows.lookup && expandedRows.lookup[dataIndex];
  }

  isRowSelectable(dataIndex: number, selectedRows?: RowsSubset) {
    const { options } = this.props;
    selectedRows = selectedRows || this.props.selectedRows;

    if (options.isRowSelectable) {
      return options.isRowSelectable(dataIndex, selectedRows);
    } else {
      return true;
    }
  }

  isRowExpandable(dataIndex: number, expandedRows?: RowsSubset) {
    const { options } = this.props;
    expandedRows = expandedRows || this.props.expandedRows;

    if (options.isRowExpandable) {
      return options.isRowExpandable(dataIndex, expandedRows);
    } else {
      return true;
    }
  }

  handleRowSelect = (data, event) => {
    let shiftKey = event && event.nativeEvent ? event.nativeEvent.shiftKey : false;
    let shiftAdjacentRows: Lookup[] = [];
    let previousSelectedRow = this.props.previousSelectedRow;

    // If the user is pressing shift and has previously clicked another row.
    if (shiftKey && previousSelectedRow && previousSelectedRow.index < this.props.data.length) {
      let curIndex = previousSelectedRow.index;

      // Create a copy of the selectedRows object. This will be used and modified
      // below when we see if we can add adjacent rows.
      let selectedRows: RowsSubset = cloneDeep(this.props.selectedRows);

      // Add the clicked on row to our copy of selectedRows (if it isn't already present).
      let clickedDataIndex = this.props.data[data.index].dataIndex;
      if (selectedRows.data.filter(d => d.dataIndex === clickedDataIndex).length === 0) {
        selectedRows.data.push({
          index: data.index,
          dataIndex: clickedDataIndex,
        });
        selectedRows.lookup[clickedDataIndex] = true;
      }

      while (curIndex !== data.index) {
        let dataIndex = this.props.data[curIndex].dataIndex;

        if (this.isRowSelectable(dataIndex, selectedRows)) {
          let lookup: Lookup = {
            index: curIndex,
            dataIndex: dataIndex,
          };

          // Add adjacent row to temp selectedRow object if it isn't present.
          if (selectedRows.data.filter(d => d.dataIndex === dataIndex).length === 0) {
            selectedRows.data.push(lookup);
            selectedRows.lookup[dataIndex] = true;
          }

          shiftAdjacentRows.push(lookup);
        }
        curIndex = data.index > curIndex ? curIndex + 1 : curIndex - 1;
      }
    }
    this.props.selectRowUpdate('cell', data, shiftAdjacentRows);
  };

  handleRowClick = (row:any, data: { rowIndex:number, dataIndex: any }, event: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't trigger onRowClick if the event was actually the expandable icon.
    if (
      event.target.id === 'expandable-button' ||
      (event.target.nodeName === 'path' && event.target.parentNode.id === 'expandable-button')
    ) {
      // In a future release, onRowClick will no longer be called here (for consistency).
      // For now, issue a deprecated warning.
      if (this.props.options.onRowClick) {
        console.warn(
          'Deprecated: Clicks on expandable button will not trigger onRowClick in an upcoming release, see: https://github.com/gregnb/mui-datatables/issues/516.',
        );
        this.props.options.onRowClick(row, data);
      }

      return;
    }

    // Don't trigger onRowClick if the event was actually a row selection via checkbox
    if (event.target.id && event.target.id.startsWith('MUIDataTableSelectCell')) return;

    // Check if we should toggle row select when row is clicked anywhere
    if (
      this.props.options.selectableRowsOnClick &&
      this.props.options.selectableRows !== 'none' &&
      this.isRowSelectable(data.dataIndex, this.props.selectedRows)
    ) {
      const selectRow = { index: data.rowIndex, dataIndex: data.dataIndex };
      this.handleRowSelect(selectRow, event);
    }
    // Check if we should trigger row expand when row is clicked anywhere
    if (
      this.props.options.expandableRowsOnClick &&
      this.props.options.expandableRows &&
      this.isRowExpandable(data.dataIndex, this.props.expandedRows)
    ) {
      const expandRow = { index: data.rowIndex, dataIndex: data.dataIndex };
      this.props.toggleExpandRow(expandRow);
    }

    // Don't trigger onRowClick if the event was actually a row selection via click
    if (this.props.options.selectableRowsOnClick) return;

    this.props.options.onRowClick && this.props.options.onRowClick(row, data, event);
  };

  render() {
    const { classes, columns, toggleExpandRow, options } = this.props;
    const tableRows = this.buildRows();
    // TODO what columns contains?
    const visibleColCnt = columns.filter(c => c.display === 'true').length;

    return (
      <MuiTableBody>
        {tableRows && tableRows.length > 0 ? (
          tableRows.map((data, rowIndex) => {
            const { data: row, dataIndex } = data;

            if (options.customRowRender) {
              return options.customRowRender(row, dataIndex, rowIndex);
            }

            return (
              <React.Fragment key={rowIndex}>
                <TableBodyRow
                  {...(options.setRowProps ? options.setRowProps(row, dataIndex) : {})}
                  options={options}
                  rowSelected={options.selectableRows !== 'none' ? this.isRowSelected(dataIndex) : false}
                  onClick={this.handleRowClick.bind(null, row, { rowIndex, dataIndex })}
                  data-testid={'MUIDataTableBodyRow-' + dataIndex}
                  id={'MUIDataTableBodyRow-' + dataIndex}>
                  <TableSelectCell
                    onChange={this.handleRowSelect.bind(null, { // TODO on change is not implemented
                      index: this.getRowIndex(rowIndex),
                      dataIndex: dataIndex,
                    })}
                    onExpand={toggleExpandRow.bind(null, {
                      index: this.getRowIndex(rowIndex),
                      dataIndex: dataIndex,
                    })}
                    // @ts-ignore
                    fixedHeader={options.fixedHeader}
                    fixedHeaderOptions={options.fixedHeaderOptions}
                    checked={this.isRowSelected(dataIndex)}
                    expandableOn={options.expandableRows}
                    // When rows are expandable, but this particular row isn't expandable, set this to true.
                    // This will add a new class to the toggle button, MUIDataTableSelectCell-expandDisabled.
                    hideExpandButton={!this.isRowExpandable(dataIndex) && options.expandableRows}
                    selectableOn={options.selectableRows}
                    isRowExpanded={this.isRowExpanded(dataIndex)}
                    isRowSelectable={this.isRowSelectable(dataIndex)}
                    id={'MUIDataTableSelectCell-' + dataIndex}
                  />
                  {row.map(
                    (column, columnIndex) =>
                      columns[columnIndex].display === 'true' && (
                        <TableBodyCell
                          {...(columns[columnIndex].setCellProps
                            ? columns[columnIndex].setCellProps(column, dataIndex, columnIndex)
                            : {})}
                          data-testid={`MuiDataTableBodyCell-${columnIndex}-${rowIndex}`}
                          dataIndex={dataIndex}
                          rowIndex={rowIndex}
                          colIndex={columnIndex}
                          columnHeader={columns[columnIndex].label}
                          print={columns[columnIndex].print}
                          options={options}
                          key={columnIndex}>
                          {column}
                        </TableBodyCell>
                      ),
                  )}
                </TableBodyRow>
                {this.isRowExpanded(dataIndex) && options.renderExpandableRow !== undefined && options.renderExpandableRow(row, { rowIndex, dataIndex })}
              </React.Fragment>
            );
          })
        ) : (
          <TableBodyRow options={options}>
            <TableBodyCell
              colSpan={options.selectableRows !== 'none' || options.expandableRows ? visibleColCnt + 1 : visibleColCnt}
              options={options}
              colIndex={0}
              rowIndex={0}>
              <Typography variant="subtitle1" className={classes.emptyTitle}>
                {options.textLabels.body.noMatch}
              </Typography>
            </TableBodyCell>
          </TableBodyRow>
        )}
      </MuiTableBody>
    );
  }
}

export default withStyles(defaultBodyStyles, { name: 'MUIDataTableBody' })(TableBody);
