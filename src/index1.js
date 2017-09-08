import ReactDOM from './react-dom';
import React from './react';
let root = document.getElementById('root');
/**
 * 1. 字符串挂载测试
 */
// ReactDOM.render('hello world', document.getElementById('root'));

/**
 * 
 * 2. DOM元素挂载测试
*/

// function handleClick() {
//   console.log('click');
// }
// let div = React.createElement(
//   'div',
//   {
//     className: 'test',
//     style: { fontSize: '30px', width: '100px', height: '200px' },
//     onClick: handleClick,
//     'data-hello': 'haha',
//   },
//   'hello world',
// );
// ReactDOM.render(div, root);

/**
 * 3. 类组件挂载测试
 */

// class Outer extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       outer: 'outer',
//     };
//     this.handleClick = this.handleClick.bind(this);
//   }
//   handleClick() {
//     console.log('click', this);
//   }
//   componentWillMount() {
//     console.log('Outer componentWillMount', this);
//   }
//   componentDidMount() {
//     console.log('Outer componentDidMount', this);
//   }
//   render() {
//     return React.createElement(
//       'div',
//       {
//         className: 'test',
//         style: { fontSize: '30px', width: '100px', height: '200px' },
//         onClick: this.handleClick,
//         'data-hello': 'haha',
//       },
//       'hello world',
//       this.props.msg,
//     );
//   }
// }

// ReactDOM.render(React.createElement(Outer, { msg: 'sivkun' }), root);
/**
 * 4. 类组件更新测试
 */
// class Outer extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       outer: 'outer',
//       counter: 0,
//     };
//     this.handleClick = this.handleClick.bind(this);
//     this.handleRandom = this.handleRandom.bind(this);
//   }
//   componentWillReceiveProps(nextProps) {
//     console.log('outer WillReceiveProps');
//   }
//   handleRandom(e) {
//     e.stopPropagation();
//     let list = [1, 2, 3, 4, 5, 6];
//     console.log('handleRandom');
//     list.sort(() => {
//       return Math.random() - 0.5;
//     });
//     this.setState(
//       { list: list.splice(Math.floor(Math.random() * 4)) },
//       function() {
//         console.log(this.state.list);
//       },
//     );
//   }
//   handleClick() {
//     console.log('click', this);
//     this.setState(
//       {
//         counter: this.state.counter + 1,
//       },
//       function() {
//         console.log('handleclick setState callback:', this.state);
//       },
//     );
//   }
//   // shouldComponentUpdate(nextProps, nextState) {
//   //   if (nextState.counter === 4) return false;
//   //   return true;
//   // }
//   componentWillUpdate(nextProps, nextState) {
//     console.log(
//       'Outer componentWillUpdate',
//       this,
//       this.state,
//       nextProps,
//       nextState,
//     );
//   }
//   componentDidUpdate(prevProps, PrevState) {
//     if (this.state.counter < 5) {
//       console.log('-------------------------');
//       let d = +new Date();
//       this.setState(
//         {
//           counter: this.state.counter + 1,
//         },
//         function() {
//           console.log('outer didupdate setState callback:', d, this.state);
//         },
//       );
//     }
//     console.log(
//       'Outer componentDidUpdate',
//       this,
//       this.state,
//       prevProps,
//       PrevState,
//     );
//   }
//   componentWillMount() {
//     this.setState(
//       {
//         counter: this.state.counter + 1,
//         list: this.props.list,
//       },
//       function() {
//         console.log('Outer WillMount setState', this.state.counter);
//       },
//     );
//     console.log('Outer componentWillMount', this);
//   }
//   componentDidMount() {
//     console.log('Outer componentDidMount', this);
//   }
//   render() {
//     console.log(this.state.counter);
//     return React.createElement(
//       'div',
//       {
//         className: 'test',
//         style: { fontSize: '30px', width: '100px', height: '200px' },
//         onClick: this.handleClick,
//         'data-hello': 'haha',
//       },
//       React.createElement(
//         'div',
//         null,
//         React.createElement('input', {
//           type: 'button',
//           value: '随机',
//           onClick: this.handleRandom,
//         }),
//       ),
//       'hello world',
//       this.props.msg,
//       this.state.outer + this.state.counter,
//       ...this.state.list,
//     );
//   }
// }

// ReactDOM.render(
//   React.createElement(Outer, { msg: 'sivkun', list: [1, 2, 3, 4, 5, 6] }),
//   root,
// );

/**
 * 5. 嵌套组件更新测试
 */
class Inner extends React.Component {
  constructor(props) {
    super(props);
    this.itemRender = this.itemRender.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    console.log('inner WillReceiveProps', nextProps.list);
  }
  itemRender() {
    let list = this.props.list;
    let result = [];
    list.forEach(item => {
      result.push(React.createElement('div', { key: item.id }, item.value));
    });
    return result;
  }

  render() {
    let list = this.itemRender();
    console.log(...list);
    return React.createElement(
      'div',
      {
        style: {
          width: '200px',
          height: '300px',
          backgroundColor: '#0f4',
        },
      },
      ...list,
    );
  }
}
class Outer extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      outer: 'outer',
      counter: 0,
      list: [
        { id: 1, value: 'A' },
        { id: 2, value: 'B' },
        { id: 3, value: 'C' },
        { id: 4, value: 'D' },
        { id: 5, value: 'E' },
        { id: 6, value: 'F' },
      ],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleRandom = this.handleRandom.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    console.log('outer WillReceiveProps');
  }
  handleRandom(e) {
    e.stopPropagation();
    let list = [
      { id: 1, value: 'A' },
      { id: 2, value: 'B' },
      { id: 3, value: 'C' },
      { id: 4, value: 'D' },
      { id: 5, value: 'E' },
      { id: 6, value: 'F' },
    ];
    // console.log('handleRandom');
    list.sort(() => {
      return Math.random() - 0.5;
    });
    this.setState(
      { list: list.splice(Math.floor(Math.random() * 4)) },
      function() {
        console.log('handleRandom setState', this.state.list);
      },
    );
  }
  handleClick() {
    console.log('click', this);
    this.setState(
      {
        counter: this.state.counter + 1,
      },
      function() {
        console.log('handleclick setState callback:', this.state);
      },
    );
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextState.counter === 4) return false;
  // }
  componentWillUpdate(nextProps, nextState) {
    console.log('Outer componentWillUpdate', nextProps, nextState);
  }
  componentDidUpdate(prevProps, PrevState) {
    if (this.state.counter < 5) {
      console.log('-------------------------');
      let d = +new Date();
      this.setState(
        {
          counter: this.state.counter + 1,
        },
        function() {
          console.log('outer didupdate setState callback:', d, this.state);
        },
      );
    }
    console.log('Outer componentDidUpdate', prevProps, PrevState);
  }
  componentWillMount() {
    this.setState(
      {
        counter: this.state.counter + 1,
      },
      function() {
        console.log('Outer WillMount setState', this.state.counter);
      },
    );
    console.log('Outer componentWillMount');
  }
  componentDidMount() {
    console.log('Outer componentDidMount', this);
  }
  render() {
    let list = this.state.list;
    console.log('Outer render', list);
    return React.createElement(
      'div',
      {
        className: 'test',
        style: {
          fontSize: '30px',
          width: '500px',
          height: '800px',
          backgroundColor: '#55d',
        },
        onClick: this.handleClick,
        'data-hello': 'haha',
      },
      React.createElement(
        'div',
        null,
        React.createElement('input', {
          type: 'button',
          value: '随机',
          onClick: this.handleRandom,
        }),
      ),
      ...this.props.children,
      'hello world! ',
      this.props.msg,
      this.state.outer + this.state.counter,
      React.createElement(Inner, {
        list: list,
      }),
    );
  }
}

ReactDOM.render(
  React.createElement(
    Outer,
    {
      msg: '#sivkun# ',
    },
    '----------------------------<br/>',
  ),
  root,
);
