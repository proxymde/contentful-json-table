import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TableRow, Button, Flex } from '@contentful/forma-36-react-components';
import { Cell } from './Cell';

const RowItem = ({
  data,
  editMode,
  devMode,
  moveRow,
  index,
  tableHeadings,
  dataLength,
  cellDefaults,
}) => {
  const [arrows, showArrows] = useState(false);
  const moveUp = () => moveRow(index, 'up');
  const moveDown = () => moveRow(index, 'down');

  const numberOfCells = tableHeadings.length;

  return (
    <TableRow
      key={index}
      onMouseOver={() => showArrows(true)}
      // onMouseEnter={() => showArrows(true)}
      onMouseLeave={() => showArrows(false)}>
      {tableHeadings &&
        tableHeadings.map((heading, i) => {
          const row = data[heading.key];
          const { text, ...rest } = row || {};
          const id = `row-${index}-cell-${i}`;
          return (
            <Cell
              readOnly={i === 0 ? !(editMode && devMode) : !editMode}
              isHeading={false}
              id={id}
              key={id}
              text={text}
              headingKey={heading.key}
              rowIndex={index}
              cellIndex={i}
              inputType={i === 0 ? 'text' : 'textarea'}
              style={{
                width: i === 0 ? '15%' : '50%',
                paddingLeft: '.5rem',
                paddingRight: '.5rem',
              }}
              empty={!text}
              arrows={
                arrows &&
                i === 1 &&
                editMode && (
                  <Flex
                    onMouseLeave={() => showArrows(false)}
                    onMouseEnter={() => showArrows(true)}
                    paddingBottom="spacingL"
                    style={{
                      display: 'flex',
                      position: 'absolute',
                      flexDirection: 'column',
                      width: 42,
                      height: 'calc(100% - 1.4rem)',
                      marginLeft: -60,
                    }}>
                    <Button
                      disabled={index === 0}
                      icon="ArrowUp"
                      buttonType="primary"
                      onClick={moveUp}
                    />
                    <Button
                      disabled={index === dataLength - 1}
                      icon="ArrowDown"
                      buttonType="muted"
                      onClick={moveDown}
                    />
                  </Flex>
                )
              }
              {...cellDefaults}
              {...rest}
            />
          );
        })}
    </TableRow>
  );
};
RowItem.propTypes = {
  data: PropTypes.object,
  editMode: PropTypes.bool,
  devMode: PropTypes.bool,
  moveRow: PropTypes.func,
  index: PropTypes.number,
  tableHeadings: PropTypes.array,
  dataLength: PropTypes.number,
  cellDefaults: PropTypes.object,
};
export default RowItem;
