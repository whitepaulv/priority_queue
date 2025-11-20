/**
 * Task list component with drag-and-drop functionality.
 */

import React, { useMemo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useTaskStore } from '../store/useTaskStore'
import TaskCard from './TaskCard'

const TaskList: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks)
  const currentView = useTaskStore((state) => state.currentView)
  const sortBy = useTaskStore((state) => state.sortBy)
  const pendingTransitions = useTaskStore((state) => state.pendingTransitions)
  const setTasks = useTaskStore((state) => state.setTasks)

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // Filter tasks based on current view
    const filtered = tasks.filter((task) => {
      const completedState = task.completed
      
      if (currentView === 'active') {
        return !completedState
      } else {
        return completedState
      }
    })

    // Sort tasks
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sortBy === 'difficulty') {
        return (b.difficulty || 0) - (a.difficulty || 0)
      } else if (sortBy === 'urgency') {
        return (b.urgency || 0) - (a.urgency || 0)
      } else if (sortBy === 'due_date') {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        const dateA = new Date(a.due_date).getTime()
        const dateB = new Date(b.due_date).getTime()
        return dateA - dateB
      }
      return 0
    })

    return sorted
  }, [tasks, currentView, sortBy, pendingTransitions])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) {
      return
    }

    // Reorder tasks in the store
    const reorderedTasks = Array.from(filteredAndSortedTasks)
    const [removed] = reorderedTasks.splice(sourceIndex, 1)
    reorderedTasks.splice(destinationIndex, 0, removed)

    // Update store with new order
    // Note: This maintains the order but doesn't persist it to backend
    // You may want to add a priority/order field to tasks if you want to persist order
    const taskIds = reorderedTasks.map((t) => t.id)
    const updatedTasks = tasks.map((task) => {
      const newIndex = taskIds.indexOf(task.id)
      return newIndex !== -1 ? { ...task, priority: newIndex } : task
    })

    setTasks(updatedTasks)
  }

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">—</div>
        <h3>{currentView === 'active' ? 'noTasks' : 'noCompletedTasks'}</h3>
        <p>
          {currentView === 'active'
            ? 'createYourFirstTask'
            : 'completedTasksWillAppearHere'}
        </p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            className="tasks-grid"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {filteredAndSortedTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <TaskCard task={task} viewMode={currentView} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default TaskList

