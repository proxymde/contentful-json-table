import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { InputButton } from './InputButton';
import { SettingsMenu } from './SettingsMenu';
import { TextInput, Textarea, TableCell } from '@contentful/forma-36-react-components';

export const Cell = ({
  arrows,
  id,
  isHeading,
  headingKey,
  text,
  rowIndex,
  cellIndex,
  setCellValue,
  updateSettings,
  setChanging,
  handleFocus,
  changing,
  empty,
  readOnly,
  inputType = 'text',
  ...rest
}) => {
  const [settingsIcon, showSettingsIcon] = useState(false);
  const [settingsMenu, showSettingsMenu] = useState(false);
  const { id: currentId } = changing;

  const toggleSettingsIcon = () => showSettingsIcon(!settingsIcon);
  const toggleSettingsMenu = () => showSettingsMenu(!settingsMenu);
  const updateAndClose = (...args: any[]) => {
    updateSettings(...args);
    showSettingsMenu(false);
    showSettingsIcon(false);
  };

  if (!empty && text.startsWith('__')) {
    return null;
  }

  return readOnly ? (
    <TableCell {...rest} dangerouslySetInnerHTML={{ __html: text ? text : '&nbsp' }} />
  ) : (
    <TableCell
      {...rest}
      key={id}
      style={{ position: 'relative', backgroundColor: settingsMenu ? '#d3dce0' : undefined }}
      onMouseEnter={() => showSettingsIcon(true)}
      onMouseLeave={() => showSettingsIcon(false)}>
      {arrows}
      {inputType === '__textarea' && (
        <Textarea
          style={
            {
              // border: '1px sol',
              // background: 'none',
              // padding: '.25rem',
              // color: empty ? (currentId === id ? 'black' : 'silver') : 'black'
            }
          }
          onFocus={empty ? handleFocus : () => null}
          width="full"
          value={empty ? 'empty' : text}
          id={id}
          onChange={() => {
            setChanging({ headingKey, rowIndex, id, isHeading }), toggleSettingsIcon();
          }}
        />
      )}
      {/*{inputType === 'text' ||*/}
      {/*  (inputType === 'textarea' && (*/}
      {/*<>*/}
      <TextInput
        id={id}
        onFocus={empty ? handleFocus : () => null}
        onChange={() => {
          setChanging({ headingKey, rowIndex, id, isHeading }), toggleSettingsIcon();
        }}
        value={empty ? '' : text}
        width="full"
      />
      {/*<TextField*/}
      {/*  // style={{*/}
      {/*  //   border: 'none',*/}
      {/*  //   background: 'none',*/}
      {/*  //   padding: '.25rem',*/}
      {/*  //   color: empty ? (currentId === id ? 'black' : 'silver') : 'black',*/}
      {/*  // }}*/}

      {/*  onFocus={empty ? handleFocus : () => null}*/}
      {/*  width="medium"*/}
      {/*  value={empty ? 'empty' : text}*/}
      {/*  id={id}*/}
      {/*  */}
      {/*  labelText={''}*/}
      {/*  name={''}*/}
      {/*/>*/}
      {/*</>*/}
      {/*))}*/}
      {currentId === id && (
        <InputButton icon="CheckCircle" onClick={() => setCellValue(headingKey, rowIndex, id)} />
      )}
      {false && settingsIcon && currentId !== id && (
        <InputButton
          icon={settingsMenu ? 'Close' : 'Settings'}
          onClick={toggleSettingsMenu}
          style={{ right: 5 }}
        />
      )}
      {false && settingsMenu && (
        <SettingsMenu
          updateAndClose={updateAndClose}
          isHeading={isHeading}
          headingKey={headingKey}
          row={rowIndex}
          id={id}
          {...rest}
        />
      )}
    </TableCell>
  );
};

Cell.propTypes = {
  id: PropTypes.string,
  isHeading: PropTypes.bool,
  headingKey: PropTypes.string,
  text: PropTypes.string,
  rowIndex: PropTypes.number,
  cellIndex: PropTypes.number,
  setCellValue: PropTypes.func,
  updateSettings: PropTypes.func,
  setChanging: PropTypes.func,
  handleFocus: PropTypes.func,
  changing: PropTypes.object,
  empty: PropTypes.bool,
  inputType: PropTypes.string,
};
