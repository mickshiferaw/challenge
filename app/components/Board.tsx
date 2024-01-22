//'use client' is used to make this component render on client-side
//by default modules on next js render on server-side (recommended)
"use client";
import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "./StrictModeDroppable";

//three lanes of the board
const initialData = {
  TODO: [],
  "IN-PROGRESS": [],
  DONE: [],
};

const Board = () => {
  const [tasks, setTasks] = useState(() => {
    // Check if there are tasks in local storage, otherwise use the initialData
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));
    return storedTasks || initialData;
  });

  useEffect(() => {
    // Save tasks to local storage whenever they change
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  //this function handles drag-and-drop interactions
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedTasks = { ...tasks };
    const [movedTask] = updatedTasks[source.droppableId].splice(
      source.index,
      1
    );
    updatedTasks[destination.droppableId].splice(
      destination.index,
      0,
      movedTask
    );

    setTasks(updatedTasks);
  };

  // this function adds a new task to a set of tasks associated with a specific lane.
  // uniue id for tasks are generated using current time stamp

  const addTask = (laneId, content) => {
    const newTask = { id: `task-${Date.now()}`, content };
    setTasks((prevTasks) => ({
      ...prevTasks,
      [laneId]: [...prevTasks[laneId], newTask],
    }));
  };

  return (
    <div className="flex justify-center mt-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.keys(tasks).map((laneId) => (
          <div key={laneId} className="p-4 border rounded m-3 bg-blue-100">
            <h2 className="text-lg font-bold mb-4">{laneId}</h2>
            <StrictModeDroppable droppableId={laneId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-100 p-4 rounded ${
                    laneId === "TODO"
                      ? "bg-red-200"
                      : laneId === "IN-PROGRESS"
                      ? "bg-yellow-200"
                      : "bg-green-200"
                  }`}
                >
                  {tasks[laneId].map((task, index1) => (
                    <Draggable
                      key={task.id}
                      draggableId={String(task.id)}
                      index={index1}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 mb-2 rounded shadow cursor-pointer"
                        >
                          {task.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>

            <input
              type="text"
              placeholder="Add a new task"
              className="mt-4 p-2 border rounded"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // @ts-ignore
                  addTask(laneId, e.target.value);
                  // @ts-ignore
                  e.target.value = "";
                }
              }}
            />
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default Board;
