import RowItem from './components/RowItem';
import * as React from 'react';
import { render } from 'react-dom';

import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  Note,
  Button,
  Paragraph,
  CheckboxField,
  FieldGroup,
  Flex,
} from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import JsonCodemirror from './components/JsonCodemirror';
import { Cell } from './components/Cell';
let timeout: number;
interface AppProps {
  sdk: FieldExtensionSDK;
}

interface AppState {
  value?: { data: any[]; tableHeadings: any[] };
  changing?: object;
  editMode?: boolean;
  showJson: boolean;
  devMode: boolean;
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      changing: {},
      editMode: false,
      devMode: false,
      value: props.sdk.field.getValue() || {
        data: [{ 'Heading 1': { text: 'col 1' } }],
        tableHeadings: [{ key: 'Heading 1' }],
      },
      showJson: false,
    };
  }

  detachExternalChangeHandler: Function | null = null;

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress = (e) => {
    //  @todo: revert input value on esc
    // if (e.key === 'Escape' && this.state.changing.id) {
    //   const { value } = this.state;
    //   this.setState({
    //     changing: {},
    //     value
    //   });
    // }

    if (e.key === 'Enter' && this.state.changing.id) {
      this.state.changing.isHeading
        ? this.setHeadingValue(
            this.state.changing.headingKey,
            this.state.changing.rowIndex,
            this.state.changing.id
          )
        : this.setCellValue(
            this.state.changing.headingKey,
            this.state.changing.rowIndex,
            this.state.changing.id
          );
      this.setState({
        changing: {},
      });
    }
  };

  onExternalChange = (value) => {
    console.log('external change', value);
    if (value) this.setState({ value });
  };

  update = async () => {
    console.log('running update');

    const { value } = this.state;
    if (value) {
      await this.props.sdk.field.setValue(value);
    } else {
      await this.props.sdk.field.removeValue();
    }
  };

  addRow = async () => {
    const { data, tableHeadings } = this.getData();
    let newRow = {};
    console.log(newRow);
    data.push(newRow);
    const val = data;

    this.setState(
      {
        value: {
          data: val,
          tableHeadings,
        },
      },
      await this.update()
    );
  };

  removeRow = async () => {
    const { data, tableHeadings } = this.getData();

    data.pop();

    this.setState(
      {
        value: {
          data,
          tableHeadings,
        },
      },
      await this.update()
    );
  };

  addColumn = async () => {
    const { data, tableHeadings } = this.getData();
    const headingName = `new column ${tableHeadings.length + 1}`;
    let newHeading = { key: headingName };
    tableHeadings.push(newHeading);
    data.map((d) => (d[headingName] = { text: '' }));
    this.setState(
      {
        value: {
          data,
          tableHeadings,
        },
      },
      await this.update()
    );
  };

  removeColumn = async () => {
    const { data, tableHeadings } = this.getData();
    const toDelete = tableHeadings[tableHeadings.length - 1];
    console.log(toDelete);

    toDelete && data.map((d) => delete d[toDelete.key]);

    tableHeadings.pop();

    this.setState(
      {
        value: {
          data,
          tableHeadings,
        },
      },
      await this.update()
    );
  };

  setHeadingValue = async (key: string, i: number) => {
    const val = document.getElementById(`heading-${i}`).value;
    const { data, tableHeadings } = this.getData();
    const originalHeading = tableHeadings[i].key;
    tableHeadings[i].key = val;

    data.map((d) => {
      this.renameObjectKey(d, originalHeading, val);
    });
    this.setState(
      {
        value: {
          data,
          tableHeadings,
        },
        changing: {},
      },
      await this.update()
    );
  };

  // update/replace cell data with an @obj
  setCell = async (key: string, row: number, obj: object, isHeading: boolean) => {
    const { data, tableHeadings } = this.getData();

    if (isHeading) {
      console.log(tableHeadings[row]);
      tableHeadings[row] = {
        ...tableHeadings[row],
        ...obj,
      };
    } else {
      console.log(data[row], data[row][key]);
      if (!data[row][key]) {
        return;
      }
      data[row][key] = {
        ...data[row][key],
        ...obj,
      };
    }

    this.setState(
      {
        value: {
          data,
          tableHeadings,
        },
        changing: {},
      },
      await this.update()
    );
  };

  // update single @property of cell data
  setCellValue = async (
    key: string,
    row: number,
    id: string,
    property: string = 'text',
    isHeading: boolean
  ) => {
    const val = document.getElementById(id).value;
    console.log(key, val);

    const { data, tableHeadings } = this.getData();

    if (isHeading) {
      console.log(tableHeadings[row]);
      tableHeadings[row][property] = val;
    } else {
      console.log(data[row], data[row][key]);
      if (!data[row][key]) {
        data[row][key] = {};
        // return;
      }
      data[row][key][property] = val;
    }

    this.setState(
      {
        value: {
          data,
          tableHeadings,
        },
        changing: {},
      },
      await this.update()
    );
  };

  updateSettings = (data: object, key: string, row: number, isHeading: boolean) => {
    console.log(data, key, row);
    this.setCell(key, row, data, isHeading);
    // this.setCellValue(key, row, data, data, isHeading);
  };

  moveRow = async (index: number, direction: string) => {
    const { data, tableHeadings } = this.getData();
    const row = data[index];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    data.splice(index, 1);
    data.splice(newIndex, 0, row);

    this.setState(
      {
        value: {
          data,
          tableHeadings,
        },
      },
      await this.update()
    );
  };

  getData = () => {
    const { value } = this.state;
    if (value) {
      return value;
    }
    return { data: [], tableHeadings: [] };
  };

  setChanging = (changing) => this.setState({ changing });

  toggleEditMode = () =>
    this.setState((prevState) => ({
      ...prevState,
      devMode: false,
      showJson: false,
      editMode: !prevState.editMode,
    }));
  toggleDevMode = () =>
    this.setState((prevState) => ({ ...prevState, devMode: !prevState.devMode }));

  // https://stackoverflow.com/a/14592469
  renameObjectKey = (obj: object, oldKey: string, newKey: string) => {
    if (oldKey !== newKey) {
      Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, oldKey));
      delete obj[oldKey];
    }
    return obj;
  };

  handleFocus = (event) => event.target.select();

  render = () => {
    const { data, tableHeadings } = this.state.value;
    const cellDefaults: object = {
      handleFocus: this.handleFocus,
      updateSettings: this.updateSettings,
      setCellValue: this.setCellValue,
      setChanging: this.setChanging,
      changing: this.state.changing,
    };
    return (
      <Flex flexDirection="column" marginBottom="spacingL">
        <div style={{ overflow: 'auto' }}>
          <FieldGroup>
            <CheckboxField
              labelText="Enable Edit Mode"
              name="readonly"
              checked={this.state.editMode}
              value="yes"
              onChange={this.toggleEditMode}
              labelIsLight={!this.state.editMode}
              style={{ paddingLeft: 5 }}
              id="editmode-checkbox"
            />
          </FieldGroup>
          <br />
          {this.state.editMode && (
            <Flex paddingBottom="spacingM">
              <Paragraph>
                Hint: press <strong>Enter</strong> to update cell data
              </Paragraph>
            </Flex>
          )}
          {!data && (
            <Note noteType="warning">
              <code>data</code> object missing
            </Note>
          )}
          {!tableHeadings && (
            <Note noteType="warning">
              <code>tableHeadings</code> object missing
            </Note>
          )}
          <Table>
            <TableHead>
              <TableRow>
                {tableHeadings &&
                  tableHeadings.map(
                    ({ key, ...rest }, i) =>
                      key &&
                      !key.startsWith('__') && (
                        <Cell
                          key={i}
                          readOnly={!(this.state.editMode && this.state.devMode)}
                          isHeading
                          text={key}
                          headingKey={key}
                          id={`heading-${i}`}
                          rowIndex={i}
                          {...cellDefaults}
                          setCellValue={this.setHeadingValue}
                          {...rest}
                        />
                      )
                  )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data &&
                data.map((dataItem, index) => (
                  <RowItem
                    key={`row-${index}`}
                    data={dataItem}
                    index={index}
                    editMode={this.state.editMode}
                    devMode={this.state.devMode}
                    moveRow={this.moveRow}
                    tableHeadings={tableHeadings}
                    dataLength={data.length}
                    cellDefaults={cellDefaults}
                  />
                ))}
            </TableBody>
          </Table>
          <br />
          {this.state.editMode && (
            <Flex paddingTop="spacingL" flexDirection="row">
              <Button icon="Plus" onClick={this.addRow}>
                Row
              </Button>{' '}
              <Button icon="Minus" onClick={this.removeRow} style={{ marginLeft: 15 }}>
                Row
              </Button>{' '}
            </Flex>
          )}
          {this.state.devMode && (
            <Flex paddingTop="spacingL" flexDirection="row">
              <Button icon="Plus" onClick={this.addColumn} buttonType="muted">
                Column
              </Button>{' '}
              <Button
                icon="Minus"
                onClick={this.removeColumn}
                style={{ marginLeft: 15 }}
                buttonType="muted">
                Column
              </Button>
            </Flex>
          )}
        </div>
        <br />
        <br />
        {this.state.editMode && (
          <CheckboxField
            labelText="Develop mode"
            name="devmode"
            checked={this.state.devMode}
            value="yes"
            onChange={this.toggleDevMode}
            labelIsLight={!this.state.devMode}
            id="devmode-checkbox"
          />
        )}
        <br />

        {this.state.editMode && this.state.devMode && (
          <Button
            onClick={() => {
              this.setState((prevState) => ({
                ...prevState,
                showJson: !prevState.showJson,
              }));
            }}
            buttonType="muted">
            toggle JSON
          </Button>
        )}
        <br />
        <br />
        {this.state.showJson && (
          <JsonCodemirror
            value={this.state.value}
            onChange={async (editor, data, value) => {
              // poor man's debounce
              this.setState({ value });
              if (timeout) {
                return;
              }
              timeout = 5000;
              setTimeout(async () => {
                await this.update();
                timeout = 0;
              }, timeout);
            }}
          />
        )}
      </Flex>
    );
  };
}

init((sdk) => {
  console.log(sdk);
  // sdk.dialogs.openAlert({
  //   title: 'fooooo',
  //   message: 'aaaaa',
  //   confirmLabel: 'bbbbb',
  //   shouldCloseOnEscapePress: true,
  //   shouldCloseOnOverlayClick: true
  // });
  sdk.window.startAutoResizer();
  render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
if (module.hot) {
  module.hot.accept();
}
