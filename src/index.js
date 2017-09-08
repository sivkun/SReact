import ReactDOM from './react-dom';
import React from './react';
let root = document.getElementById('root');
/* eslint-disable */
const TYPES = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
};

class AddTodo extends React.Component {
  constructor() {
    super();
    this.onAddClick = this.onAddClick.bind(this);
  }
  onAddClick() {
    var text = document.getElementById('addInput');
    this.props.onClick(text.value);
    text.value = '';
  }
  render() {
    return React.createElement(
      'div',
      null,
      React.createElement('input', {
        id: 'addInput',
        type: 'text'
      }),
      React.createElement('input', {
        type: 'button',
        value: '添加',
        onClick: this.onAddClick
      })
    );
  }
}
class Todo extends React.Component {
  render() {
    let completed = this.props.completed;
    return React.createElement(
      'li',
      {
        onClick: this.props.onClick,
        style: {
          textDecoration: completed ? 'line-through' : 'none'
        }
      },
      this.props.text
    );
  }
}
class TodoList extends React.Component {
  constructor() {
    super();
  }
  render() {
    let todos = this.props.todos || [];
    todos = todos.filter(todo => {
      if (this.props.filter === TYPES.SHOW_ACTIVE) {
        return todo.completed === false;
      } else if (this.props.filter === TYPES.SHOW_COMPLETED) {
        return todo.completed === true;
      } else {
        return true;
      }
    });
    todos = todos.map(todo => {
      return React.createElement(Todo, {
        key: todo.id,
        text: todo.text,
        completed: todo.completed,
        onClick: () => this.props.onClick(todo.id)
      });
    });
    return React.createElement('ul', null, ...todos);
  }
}

class Footer extends React.Component {
  onFilter = e => {
    let target = e.target;
    if (target.tagName === 'A') {
      this.props.onClick(target.getAttribute('type'));
    }
  };
  render() {
    return React.createElement(
      'div',
      { onClick: this.onFilter },
      'SHOW:',
      React.createElement(
        'a',
        { type: TYPES.SHOW_ALL, href: 'javascript:void(0)',style:{margin:'5px'} },
        ' ALL '
      ),
      React.createElement(
        'a',
        { type: TYPES.SHOW_COMPLETED, href: 'javascript:void(0)',style:{margin:'5px'} },
        ' COMPLETED '
      ),
      React.createElement(
        'a',
        { type: TYPES.SHOW_ACTIVE, href: 'javascript:void(0)',style:{margin:'5px'} },
        ' ACTIVE '
      )
    );
  }
}
class App extends React.Component {
  constructor() {
    super();
    this.nextTodo = 0;
    this.state = {
      todos: [
        { id: this.nextTodo++, text: 'javascript', completed: false },
        { id: this.nextTodo++, text: 'CSS', completed: false },
        { id: this.nextTodo++, text: 'HTML', completed: false },
        { id: this.nextTodo++, text: 'PHP', completed: false }
      ],
      filter: TYPES.SHOW_ALL
    };
    this.onAddClick = this.onAddClick.bind(this);
  }
  onAddClick(text) {
    let todos = this.state.todos.slice();
    todos.push({
      id: this.nextTodo++,
      text: text,
      completed: false
    });
    this.setState({ todos: todos });
  }
  onTodoClick = id => {
    let todos = this.state.todos.map(todo => {
      if (todo.id === id)
        return Object.assign(todo, { completed: !todo.completed });
      else return todo;
    });
    this.setState({ todos: todos }, () => console.log(this.state.todos));
  };
  onFilterTodo = type => {
    this.setState({
      filter: type
    });
  };
  render() {
    return React.createElement(
      'div',
      null,
      React.createElement(AddTodo, {
        onClick: this.onAddClick
      }),
      React.createElement(TodoList, {
        filter: this.state.filter,
        todos: this.state.todos,
        onClick: this.onTodoClick
      }),
      React.createElement(Footer, { onClick: this.onFilterTodo })
    );
  }
}

ReactDOM.render(React.createElement(App), root);
