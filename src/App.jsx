

// USING useReducer() INSTEAD OF useState() to build app App

// * useReducer() Review - Part 2: Refactor ("rewrite") the app to use useReducer()

// ? Task 1: Before we begin, what 3 action types will our reducer need?
// ? i.e. What 3 things do we want to allow the user to do when they are using the app?
// Change the value of the ToDo input
// Add a ToDo
// Delete a ToDo

// * Step 1 - Import useReducer and useEffect
import { useEffect, useReducer } from "react";

// * Step 2 - Load todos from localStorage on app start
const getInitialTodos = () => {
  const saved = localStorage.getItem("todos");
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
};

// * Step 3 - Create initial state
const initialState = {
  toDoContent: "",
  toDos: getInitialTodos(), // <-- Load from localStorage
  editingId: null,         // id of the todo being edited
  editingContent: ""       // temp value for editing
};

// * Step 4 - Create reducer function
function reducer(state, actionObj) {
  switch(actionObj.type) {
    // User journey:
    // 1. User types into input -> whenever input changes dispatch a "CHANGE" action to the reducer
    //   -> Update state.toDoContent with what the user typed
    // 2. User finishes typing, clicks button --> dispatch an "ADD" action to the reducer
    //   -> Update state.toDos (adds a new object based on state.toDoContent)
    //   -> Reset state.toDoContent to an empty string
    // 3. User wants to delete a ToDo, click its "X" --> dispatch a "DELETE" action to the reducer
    //   -> Update state.toDos to remove the object with the same id 
    case "CHANGE":
      return { ...state, toDoContent: actionObj.payload }
    
    case "ADD": {
      if (state.toDoContent.length > 0) {
        const newToDo = {
          content: state.toDoContent,
          id: Math.random().toFixed(16).slice(2)
        };
        return {
          ...state,
          toDoContent: "",
          toDos: [ ...state.toDos, newToDo ]
        }
      } else {
        alert("Please type something!");
        return state;
      }
    }

    case "DELETE": {
      const filteredArray = state.toDos.filter(obj => obj.id !== actionObj.payload);
      return {
        ...state,
        toDos: filteredArray 
      }
    }

    case "START_EDIT":
      return {
        ...state,
        editingId: actionObj.payload.id,
        editingContent: actionObj.payload.content
      };

    case "CHANGE_EDIT":
      return {
        ...state,
        editingContent: actionObj.payload
      };

    case "SAVE_EDIT":
      return {
        ...state,
        toDos: state.toDos.map(todo =>
          todo.id === state.editingId
            ? { ...todo, content: state.editingContent }
            : todo
        ),
        editingId: null,
        editingContent: ""
      };

    case "CANCEL_EDIT":
      return {
        ...state,
        editingId: null,
        editingContent: ""
      };

    default: 
      console.log("Unknown action type", actionObj.type);
      return state;
  }
}

function App() {
  // * Step 5 - Initialize reducer
  // 1. state: the app's state
  // 2. dispatch: the dispatch function
  //   - used to send *action* objects to the reducer (Part 3)
  //   - the "type" of action sent (and any "payload" - i.e. data) lets the reducer know how it should update state (Part 1)
  //   - once state has been updated, a re-render is triggered
  // 3. reducer: the "reducer" function that defines how state should be updated
  // 4. initialState: the starting value of the app's state
  //        1       2                       3          4  
  const [ state, dispatch ] = useReducer(reducer, initialState);

  // * Step 6 - Persist todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(state.toDos));
  }, [state.toDos]);

  // Change the input when the user types into it
  // * Step 7 - Dispatch a "CHANGE" action (with payload) to the reducer for processing
  function handleChangeToDo({ target }) {
    dispatch({ 
      type: "CHANGE" ,
      payload: target.value
    });
  }

  // Add a "ToDo" object to the `toDos` state array when the user clicks the button
  function handleAddToDo(e) {
    e.preventDefault();
    dispatch({
      type: "ADD"
    });
  }

  // To delete a ToDo
  function handleDeleteToDo(id) {
    dispatch({
      type: "DELETE",
      payload: id
    })
  }

  function handleStartEdit(todo) {
    dispatch({ type: "START_EDIT", payload: { id: todo.id, content: todo.content } });
  }

  function handleChangeEdit(e) {
    dispatch({ type: "CHANGE_EDIT", payload: e.target.value });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    dispatch({ type: "SAVE_EDIT" });
  }

  function handleCancelEdit() {
    dispatch({ type: "CANCEL_EDIT" });
  }

  return (
    <>
      <header>
        <h1> The TO-DOS App</h1>
      </header>

      <main className="container">
        {/* Part 1: Let the user create a new ToDo */}
        <form>
          <input id="todo-content" name="todo-content" value={state.toDoContent} onChange={handleChangeToDo} />
          <button onClick={handleAddToDo}>Create a new To-Do</button>
        </form>
        
        {/* Part 2: List the user's ToDos (if any) */}
        <h2>My To-Dos</h2>
        {
          state.toDos.length === 0
            ? <p>You currently have no To-Dos!</p>
            : <>
              {
                state.toDos.map(obj => (
                  <div className="todo-row" key={obj.id}>
                    <div className="todo">
                      {state.editingId === obj.id ? (
                        <form onSubmit={handleSaveEdit} style={{ display: "flex", alignItems: "center" }}>
                          <input
                            value={state.editingContent}
                            onChange={handleChangeEdit}
                            autoFocus
                            style={{ width: "150px", marginRight: "8px" }}
                          />
                          <button type="submit">Save</button>
                          <button type="button" onClick={handleCancelEdit} style={{ marginLeft: "4px" }}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          {obj.content}
                          <button
                            className="edit"
                            type="button"
                            onClick={() => handleStartEdit(obj)}
                            style={{ marginLeft: "10px" }}
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      className="delete"
                      type="button"
                      onClick={() => handleDeleteToDo(obj.id)}
                    >
                      Delete To-do
                    </button>
                  </div>
                ))
              }
            </>
        }    
      </main>
    </>
  );
}

export default App;