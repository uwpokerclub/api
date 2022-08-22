package services

import (
	e "api/internal/errors"
	"api/internal/models"
	"errors"

	"gorm.io/gorm"
)

type userService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *userService {
	return &userService{db: db}
}

func (u *userService) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	user := models.User{
		ID:        req.ID,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Faculty:   req.Faculty,
		QuestID:   req.QuestID,
	}

	res := u.db.Create(&user)
	if err := res.Error; err != nil {
		return nil, e.InternalServerError(err.Error())
	}

	return &user, nil
}

func (u *userService) ListUsers() ([]models.User, error) {
	var users []models.User

	res := u.db.Order("created_at DESC").Find(&users)
	if err := res.Error; err != nil {
		return nil, e.InternalServerError(err.Error())
	}

	return users, nil
}

func (u *userService) GetUser(id uint64) (*models.User, error) {
	user := models.User{ID: id}

	res := u.db.First(&user)

	// Check if the error is a not found error
	if err := res.Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, e.NotFound(err.Error())
	}

	// Any other DB error is a server error
	if err := res.Error; err != nil {
		return nil, e.InternalServerError(err.Error())
	}

	return &user, nil
}

func (u *userService) UpdateUser(id uint64, req *models.UpdateUserRequest) (*models.User, error) {
	user := models.User{ID: id}

	res := u.db.First(&user)

	// Check if the error is a not found error
	if err := res.Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, e.NotFound(err.Error())
	}

	// Any other DB error is a server error
	if err := res.Error; err != nil {
		return nil, e.InternalServerError(err.Error())
	}

	// Perform updates. Only update fields that are in the request.
	// NOTE: There has to be a better way to do this, however other
	// documented methods I tried didn't perform the updates properly.
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Faculty != "" {
		user.Faculty = req.Faculty
	}
	if req.QuestID != "" {
		user.QuestID = req.QuestID
	}

	res = u.db.Save(&user)

	if err := res.Error; err != nil {
		return nil, e.InternalServerError(err.Error())
	}

	return &user, nil
}

func (u *userService) DeleteUser(id uint64) error {
	user := models.User{ID: id}

	res := u.db.Delete(&user)
	if err := res.Error; err != nil {
		return e.InternalServerError(err.Error())
	}

	return nil
}
